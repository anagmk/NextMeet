import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import ChatSideBar from "./ChatSideBar";
import {
  Code2,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  PhoneOff,
  Video,
  VideoOff,
  Wrench,
} from "lucide-react";
import Editor from "@monaco-editor/react";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function CallScreen() {
  const { meetingCode } = useParams();
  const location = useLocation();
  const initialCamOn = location.state?.camOn ?? true;
  const initialMicOn = location.state?.micOn ?? true;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [joinError, setJoinError] = useState("");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteSocketIdRef = useRef<string | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidate[]>([]);
  const [micOn, setMicOn] = useState(initialMicOn);
  const [camOn, setCamOn] = useState(initialCamOn);
  const navigate = useNavigate();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// start coding here");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [videoPanelHeight, setVideoPanelHeight] = useState(220);
  const [codePanelWidth, setCodePanelWidth] = useState(50);
  const [terminalHeight, setTerminalHeight] = useState(150);
  const [isResizing, setIsResizing] = useState(false);
  const [isTerminalResizing, setIsTerminalResizing] = useState(false);
  const [isCodeResizing, setIsCodeResizing] = useState(false);
  const isRemoteUpdate = useRef(false);
  const dragStartYRef = useRef<number | null>(null);
  const startVideoHeightRef = useRef(videoPanelHeight);
  const terminalDragStartYRef = useRef<number | null>(null);
  const startTerminalHeightRef = useRef(terminalHeight);
  const codeDragStartXRef = useRef<number | null>(null);
  const startCodePanelWidthRef = useRef(codePanelWidth);
  const codeWorkspaceRef = useRef<HTMLDivElement>(null);
  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    }
  };

  const ensureLocalStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    stream.getAudioTracks().forEach((track) => {
      track.enabled = initialMicOn;
    });
    stream.getVideoTracks().forEach((track) => {
      track.enabled = initialCamOn;
    });

    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    return stream;
  }, [initialCamOn, initialMicOn]);

  // Join meeting via REST API
  useEffect(() => {
    const autoJoinMeeting = async () => {
      if (!meetingCode) return;
      try {
        const res = await fetch("/api/user/meetings/join", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingCode }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok && data.message !== "User already joined the meeting") {
          throw new Error(data.message || "Failed to join meeting");
        }
      } catch (error) {
        setJoinError(
          error instanceof Error
            ? error.message
            : "Unable to join this meeting.",
        );
      }
    };
    autoJoinMeeting();
  }, [meetingCode]);

  // Create the peer connection once, reused throughout the call
  const createPeerConnection = useCallback(
    (remoteSocketId: string, socketInstance: Socket) => {
      if (
        peerConnectionRef.current &&
        remoteSocketIdRef.current === remoteSocketId
      ) {
        return peerConnectionRef.current;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);

      const stream = localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      }

      pc.ontrack = (event) => {
        if (!remoteVideoRef.current) return;

        if (event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          return;
        }

        const remoteStream =
          remoteVideoRef.current.srcObject instanceof MediaStream
            ? remoteVideoRef.current.srcObject
            : new MediaStream();
        remoteStream.addTrack(event.track);
        remoteVideoRef.current.srcObject = remoteStream;
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          console.warn("Peer connection ended for:", remoteSocketId);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketInstance.emit("webrtc-ice-candidate", {
            meetingCode,
            candidate: event.candidate,
            to: remoteSocketId,
          });
        }
      };

      remoteSocketIdRef.current = remoteSocketId;
      peerConnectionRef.current = pc;
      return pc;
    },
    [meetingCode],
  );

  // Socket + WebRTC signaling
  useEffect(() => {
    if (!meetingCode) return;

    const newSocket = io(import.meta.env.VITE_SERVER_URL, {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to server:", newSocket.id);
      newSocket.emit("join-meeting", meetingCode);
    });

    // Someone else joined AFTER us — WE create the offer
    newSocket.on("user-joined", async ({ socketId }: { socketId: string }) => {
      console.log("Another user joined:", socketId);

      if (!socketId || socketId === newSocket.id) return;

      const stream = await ensureLocalStream();
      const pc = createPeerConnection(socketId, newSocket);
      if ((stream && !pc.signalingState) || pc.signalingState === "stable") {
        stream.getTracks().forEach((track) => {
          if (!pc.getSenders().some((sender) => sender.track === track)) {
            pc.addTrack(track, stream);
          }
        });
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      newSocket.emit("webrtc-offer", {
        meetingCode,
        offer,
        to: socketId,
      });
    });

    // We received an offer — WE are the new joiner, create an answer
    newSocket.on(
      "webrtc-offer",
      async ({
        offer,
        from,
      }: {
        offer: RTCSessionDescriptionInit;
        from: string;
      }) => {
        if (!from || from === newSocket.id) return;

        const stream = await ensureLocalStream();
        const pc = createPeerConnection(from, newSocket);
        if (stream && pc.signalingState === "stable") {
          stream.getTracks().forEach((track) => {
            if (!pc.getSenders().some((sender) => sender.track === track)) {
              pc.addTrack(track, stream);
            }
          });
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        for (const candidate of pendingIceCandidatesRef.current) {
          await pc.addIceCandidate(candidate);
        }
        pendingIceCandidatesRef.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        newSocket.emit("webrtc-answer", {
          meetingCode,
          answer,
          to: from,
        });
      },
    );

    // Our offer got answered
    newSocket.on(
      "webrtc-answer",
      async ({
        answer,
        from,
      }: {
        answer: RTCSessionDescriptionInit;
        from: string;
      }) => {
        if (!answer || !peerConnectionRef.current) return;
        remoteSocketIdRef.current = from || remoteSocketIdRef.current;
        const peerConnection = peerConnectionRef.current;
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer),
        );

        for (const candidate of pendingIceCandidatesRef.current) {
          await peerConnection.addIceCandidate(candidate);
        }
        pendingIceCandidatesRef.current = [];
      },
    );

    // ICE candidates trickling in from the peer
    newSocket.on(
      "webrtc-ice-candidate",
      async ({
        candidate,
        from,
      }: {
        candidate: RTCIceCandidateInit;
        from: string;
      }) => {
        if (!candidate || !peerConnectionRef.current) return;
        remoteSocketIdRef.current = from || remoteSocketIdRef.current;
        try {
          const iceCandidate = new RTCIceCandidate(candidate);
          if (!peerConnectionRef.current.remoteDescription) {
            pendingIceCandidatesRef.current.push(iceCandidate);
            return;
          }
          await peerConnectionRef.current.addIceCandidate(iceCandidate);
        } catch (err) {
          console.error("Failed to add ICE candidate:", err);
        }
      },
    );

    newSocket.on("code-change", ({ code: incomingCode }) => {
      isRemoteUpdate.current = true;
      setCode(incomingCode);
    });

    setSocket(newSocket);

    return () => {
      peerConnectionRef.current?.close();
      newSocket.disconnect();
    };
  }, [createPeerConnection, ensureLocalStream, meetingCode]);

  // Local camera/mic
  useEffect(() => {
    async function startLocalMedia() {
      try {
        await ensureLocalStream();
      } catch (err) {
        console.error("Failed to get local media:", err);
      }
    }
    startLocalMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [ensureLocalStream]);

  const leaveCall = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    socket?.disconnect();

    navigate("/dashboard");
  };

  const handleEditorChange = (value: string | undefined) => {
    const nextCode = value ?? "";
    setCode(nextCode);

    // don't re-broadcast a change that just arrived FROM the socket
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    socket?.emit("code-change", { meetingCode, code: nextCode });
  };

  useEffect(() => {
    if (!isResizing && !isTerminalResizing && !isCodeResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (isResizing && dragStartYRef.current !== null) {
        const delta = event.clientY - dragStartYRef.current;
        setVideoPanelHeight(
          Math.min(420, Math.max(120, startVideoHeightRef.current + delta)),
        );
      }

      if (isTerminalResizing && terminalDragStartYRef.current !== null) {
        const delta = terminalDragStartYRef.current - event.clientY;
        setTerminalHeight(
          Math.min(300, Math.max(100, startTerminalHeightRef.current + delta)),
        );
      }

      if (isCodeResizing && codeDragStartXRef.current !== null) {
        const workspaceWidth = codeWorkspaceRef.current?.clientWidth ?? 0;
        if (workspaceWidth > 0) {
          const delta = event.clientX - codeDragStartXRef.current;
          const widthDelta = (delta / workspaceWidth) * 100;
          setCodePanelWidth(
            Math.min(
              80,
              Math.max(20, startCodePanelWidthRef.current + widthDelta),
            ),
          );
        }
      }
    };

    const handleMouseUp = () => {
      dragStartYRef.current = null;
      terminalDragStartYRef.current = null;
      codeDragStartXRef.current = null;
      setIsResizing(false);
      setIsTerminalResizing(false);
      setIsCodeResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isCodeResizing, isResizing, isTerminalResizing]);

  const startResize = (event: React.MouseEvent<HTMLDivElement>) => {
    dragStartYRef.current = event.clientY;
    startVideoHeightRef.current = videoPanelHeight;
    setIsResizing(true);
  };

  const startTerminalResize = (event: React.MouseEvent<HTMLDivElement>) => {
    terminalDragStartYRef.current = event.clientY;
    startTerminalHeightRef.current = terminalHeight;
    setIsTerminalResizing(true);
  };

  const startCodeResize = (event: React.MouseEvent<HTMLDivElement>) => {
    codeDragStartXRef.current = event.clientX;
    startCodePanelWidthRef.current = codePanelWidth;
    setIsCodeResizing(true);
  };

  const [output, setOutput] = useState(
    "Click Run to see your code output here.",
  );
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user/judge/run`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language: language,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setOutput(data.message || "Something went wrong running your code.");
        return;
      }

      const { stdout, stderr, code: exitCode } = data.run;

      if (exitCode !== 0 && stderr) {
        setOutput(stderr);
      } else {
        setOutput(stdout || "Code ran successfully with no output.");
      }
    } catch (err) {
      setOutput("Failed to reach the code execution service.");
      console.error("Run error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = () => {
    console.log("Submitting solution:", code); // real submit logic comes later
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] p-4 text-white md:p-6">
      {joinError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {joinError}
        </div>
      )}

      <div className="flex h-[calc(100vh-2rem)] gap-4">
        <main className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1117]">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b8f9d]">
                  Live Meeting
                </p>
                <h1 className="mt-1 text-xl font-semibold text-white">
                  {meetingCode}
                </h1>
              </div>
            </div>

            <div
              className="flex items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,rgba(81,70,229,0.18),transparent_35%)] p-6"
              style={{
                height: isEditorFullscreen ? "10px" : `${videoPanelHeight}px`,
                minHeight: isEditorFullscreen ? "140px" : "10px",
                transition: "height 0.2s ease",
              }}
            >
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="max-h-full max-w-[45%] rounded-2xl border border-white/15 bg-[#141923]"
              />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="max-h-full max-w-[45%] rounded-2xl border border-white/15 bg-[#141923]"
              />
            </div>

            <div
              role="separator"
              aria-label="Resize video and editor panes"
              className="h-2 cursor-row-resize bg-transparent"
              onMouseDown={startResize}
            />

            {isEditorOpen && (
              <>
                <div
                  className="w-full overflow-hidden rounded-b-2xl border border-white/10"
                  style={{
                    height: isEditorFullscreen
                      ? "calc(100% - 140px - 52px)"
                      : "calc(100% - 220px - 52px)",
                    minHeight: isEditorFullscreen ? "420px" : "260px",
                    transition: "height 0.2s ease",
                  }}
                >
                  <div
                    ref={codeWorkspaceRef}
                    className="relative flex h-full min-h-0"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditorOpen(false);
                        setIsEditorFullscreen(false);
                      }}
                      aria-label="Close code editor"
                      className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#141b25]/90 text-lg text-white transition hover:bg-[#1d2633]"
                    >
                      ×
                    </button>

                    <div
                      className="flex h-full min-w-0 flex-col border-r border-white/10 bg-[#0f1117]"
                      style={{ width: `${codePanelWidth}%` }}
                    >
                      <div className="min-h-0 flex-1">
                        <Editor
                          height="100%"
                          defaultLanguage="javascript"
                          value={code}
                          onChange={handleEditorChange}
                          theme="vs-dark"
                          options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                          }}
                        />
                      </div>
                      <div
                        role="separator"
                        aria-label="Resize editor and terminal panes"
                        className="h-2 shrink-0 cursor-row-resize bg-[#1b1f2a] hover:bg-[#5146e5]"
                        onMouseDown={startTerminalResize}
                      />
                      <div
                        className="shrink-0 overflow-y-auto border-t border-white/10 bg-[#0d0e14] p-4 font-mono text-[13px] text-[#d7d7dc]"
                        style={{ height: `${terminalHeight}px` }}
                      >
                        <div className="mb-2 text-[11px] uppercase tracking-wide text-[#6b6f80]">
                          Terminal
                        </div>

                        {isRunning ? (
                          <p className="text-[#8b8f9d]">Running...</p>
                        ) : (
                          <pre className="whitespace-pre-wrap">{output}</pre>
                        )}
                      </div>
                      <div className="flex items-center justify-end gap-2 border-t border-white/10 px-3 py-3">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="rounded-lg bg-[#282832] px-3 py-2 text-sm text-white outline-none"
                        >
                          <Editor
                            height="100%"
                            language={language}
                            value={code}
                            onChange={handleEditorChange}
                            theme="vs-dark"
                            options={{
                              fontSize: 14,
                              minimap: { enabled: false },
                            }}
                          />
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                          <option value="c">C</option>
                          <option value="typescript">TypeScript</option>
                          <option value="go">Go</option>
                        </select>
                        <button
                          onClick={handleRun}
                          disabled={isRunning}
                          className="rounded-lg bg-[#282832] px-4 py-2 text-sm text-white transition hover:bg-[#33333f] disabled:opacity-50"
                        >
                          {isRunning ? "Running..." : "Run"}
                        </button>

                        <button
                          onClick={handleSubmit}
                          className="rounded-lg bg-[#5146e5] px-4 py-2 text-sm text-white transition hover:bg-[#4338d9]"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                    <div
                      className="relative h-full bg-white"
                      style={{ width: `${100 - codePanelWidth}%` }}
                      aria-label="Future question workspace"
                    >
                      <div
                        role="separator"
                        aria-label="Resize code and question panes"
                        className="absolute left-0 top-0 h-full w-2 -translate-x-1/2 cursor-col-resize bg-[#d7d7dc] hover:bg-[#5146e5]"
                        onMouseDown={startCodeResize}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end border-t border-white/10 px-4 py-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorFullscreen((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#1b1f2a] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#252b38]"
                  >
                    {isEditorFullscreen ? (
                      <>
                        <Minimize2 size={14} />
                        Exit full view
                      </>
                    ) : (
                      <>
                        <Maximize2 size={14} />
                        Full view
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
            <div className="relative mt-auto flex justify-center gap-4 border-t border-white/10 px-5 py-4">
              <button
                onClick={toggleMic}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                  micOn
                    ? "bg-[#282832] text-white hover:bg-[#33333f]"
                    : "bg-red-500/90 text-white hover:bg-red-500"
                }`}
              >
                {micOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>

              <button
                onClick={toggleCam}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                  camOn
                    ? "bg-[#282832] text-white hover:bg-[#33333f]"
                    : "bg-red-500/90 text-white hover:bg-red-500"
                }`}
              >
                {camOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsToolsOpen((value) => !value)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#282832] text-white transition hover:bg-[#33333f]"
                  aria-label="Open meeting tools"
                >
                  <Wrench size={18} />
                </button>

                {isToolsOpen && (
                  <div className="absolute bottom-14 left-1/2 z-20 w-44 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#151b26] p-2 shadow-2xl shadow-black/30">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditorOpen((value) => !value);
                        setIsToolsOpen(false);
                        if (!isEditorOpen) {
                          setIsEditorFullscreen(false);
                        }
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/5"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2a3244] text-[#94a3b8]">
                        <Code2 size={16} />
                      </div>
                      <span>{isEditorOpen ? "Hide code" : "Open code"}</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={leaveCall}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700"
              >
                <PhoneOff size={18} />
              </button>
            </div>
          </div>
        </main>

        <div className="w-75 shrink-0">
          <ChatSideBar
            socket={socket}
            meetingCode={meetingCode}
            onClose={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
