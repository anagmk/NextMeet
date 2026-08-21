import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import ChatSideBar from "./ChatSideBar";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
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

  const [code, setCode] = useState("// start coding here");
  const isRemoteUpdate = useRef(false);

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

  const ensureLocalStream = async () => {
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
  };

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
  function createPeerConnection(
    remoteSocketId: string,
    socketInstance: Socket,
  ) {
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
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
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
  }

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
  }, [meetingCode]);

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
  }, []);

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

            <div className="flex flex-1 items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,_rgba(81,70,229,0.18),_transparent_35%)] p-6">
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
            <div className="h-[500px] w-full overflow-hidden rounded-2xl border border-white/10">
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
            <div className="flex justify-center gap-4 border-t border-white/10 px-5 py-4">
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

              <button
                onClick={leaveCall}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700"
              >
                <PhoneOff size={18} />
              </button>
            </div>
          </div>
        </main>

        <div className="w-[300px] shrink-0">
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
