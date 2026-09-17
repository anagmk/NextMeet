import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Check, MessageCircle, X } from "lucide-react";
import ChatSideBar from "./ChatSideBar";
import CallControls from "./call-screen/CallControls";
import CodeEditorPanel from "./call-screen/CodeEditorPanel";
import useCallConnection from "./call-screen/useCallConnection";
import VideoPanel from "./call-screen/VideoPanel";
import { useUser } from "../../context/UserContext"; // adjust path

type GeneratedQuestion = {
  questionId: string;
  title: string;
  description: string;
  starterCode: string;
  language: string;
  functionName: string;
  testCases: { args: string[]; expectedOutput: string; isHidden: boolean }[];
};

type JoinRequest = { id: string; name: string; email: string };

export default function CallScreen() {
  const { meetingCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const initialCamOn = location.state?.camOn ?? true;
  const initialMicOn = location.state?.micOn ?? true;
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [code, setCode] = useState("// start coding here");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [videoPanelHeight, setVideoPanelHeight] = useState(220);
  const [isHost, setIsHost] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [joinRequest, setJoinRequest] = useState<JoinRequest | null>(null);
  const resizeStartRef = useRef<number | null>(null);
  const heightStartRef = useRef(videoPanelHeight);
  const isRemoteCodeUpdate = useRef(false);

  const handleRemoteCodeChange = useCallback((incomingCode: string) => {
    isRemoteCodeUpdate.current = true;
    setCode(incomingCode);
  }, []);

  const handleQuestionGenerated = useCallback(
    (incomingQuestion: GeneratedQuestion) => {
      setQuestion(incomingQuestion);
      setCode(incomingQuestion.starterCode); // NEW — reset editor to the question's starter code
    },
    [],
  );

  const { socket, joinError, accessDenied, micOn, camOn, toggleMic, toggleCam, leaveCall } =
    useCallConnection({
      meetingCode,
      initialMicOn,
      initialCamOn,
      localVideoRef,
      remoteVideoRef,
      onRemoteCodeChange: handleRemoteCodeChange,
      onQuestionGenerated: handleQuestionGenerated,
    });

  useEffect(() => {
    if (!meetingCode || !user) return;
    const fetchMeeting = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/meetings/code/${meetingCode}`,
          { credentials: "include" },
        );
        const data = await response.json();
        setMeetingId(data?.meeting?._id ?? data?.meeting?._id?.toString() ?? null);
        const hostId = data?.meeting?.hostId?._id ?? data?.hostId?._id;
        const currentUserId =
          (user as { _id?: string; id?: string })._id ??
          (user as { id?: string }).id;
        setIsHost(Boolean(hostId && currentUserId && hostId === currentUserId));
      } catch (error) {
        console.error("Failed to fetch meeting details:", error);
      }
    };
    void fetchMeeting();
  }, [meetingCode, user]);

  useEffect(() => {
    if (!socket) return;
    const handleJoinRequest = ({ meetingCode: requestedCode, requester }: { meetingCode: string; requester: JoinRequest }) => {
      if (requestedCode === meetingCode) setJoinRequest(requester);
    };
    socket.on("join-request", handleJoinRequest);
    return () => { socket.off("join-request", handleJoinRequest); };
  }, [isHost, meetingCode, socket]);

  useEffect(() => {
    if (accessDenied) {
      leaveCall();
      navigate("/dashboard", { state: { notification: "Rejected" } });
    }
  }, [accessDenied, leaveCall, navigate]);

  const respondToJoin = (decision: "allow" | "reject") => {
    if (!socket || !meetingCode || !joinRequest) return;
    socket.emit("respond-to-join", { meetingCode, requesterId: joinRequest.id, decision });
    setJoinRequest(null);
  };

  const startVideoResize = (event: React.MouseEvent<HTMLDivElement>) => {
    resizeStartRef.current = event.clientY;
    heightStartRef.current = videoPanelHeight;
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (resizeStartRef.current !== null)
        setVideoPanelHeight(
          Math.min(
            420,
            Math.max(
              120,
              heightStartRef.current +
                moveEvent.clientY -
                resizeStartRef.current,
            ),
          ),
        );
    };
    const onMouseUp = () => {
      resizeStartRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleCodeChange = (value: string | undefined) => {
    const nextCode = value ?? "";
    setCode(nextCode);
    if (isRemoteCodeUpdate.current) {
      isRemoteCodeUpdate.current = false;
      return;
    }
    socket?.emit("code-change", { meetingCode, code: nextCode });
  };

  const toggleEditor = () => {
    setIsEditorOpen((open) => !open);
    if (!isEditorOpen) setIsEditorFullscreen(false);
  };
  const closeEditor = () => {
    setIsEditorOpen(false);
    setIsEditorFullscreen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] p-4 text-white md:p-6">
      {joinRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#171a22] p-5 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b8f9d]">Join request</p>
            <h2 className="mt-2 text-lg font-semibold">{joinRequest.name} wants to join</h2>
            <p className="mt-1 text-sm text-[#aeb2c0]">{joinRequest.email}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => respondToJoin("reject")} className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-200 hover:bg-red-400/10"><X size={16} /> Reject</button>
              <button type="button" onClick={() => respondToJoin("allow")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-500"><Check size={16} /> Allow</button>
            </div>
          </div>
        </div>
      )}
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
              {!isChatOpen && (
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-[#d7d7dc] transition hover:bg-white/5"
                >
                  <MessageCircle size={16} />
                  Open chat
                </button>
              )}
            </div>
            <VideoPanel
              localVideoRef={localVideoRef}
              remoteVideoRef={remoteVideoRef}
              height={videoPanelHeight}
              isEditorFullscreen={isEditorFullscreen}
              onResizeStart={startVideoResize}
            />
            {isEditorOpen && (
              <CodeEditorPanel
                code={code}
                onCodeChange={handleCodeChange}
                onClose={closeEditor}
                isFullscreen={isEditorFullscreen}
                onToggleFullscreen={() =>
                  setIsEditorFullscreen((value) => !value)
                }
                socket={socket}
                meetingCode={meetingCode}
                isHost={isHost}
                question={question}
                onQuestionGenerated={handleQuestionGenerated}
              />
            )}
            <CallControls
              micOn={micOn}
              camOn={camOn}
              isEditorOpen={isEditorOpen}
              onToggleMic={toggleMic}
              onToggleCam={toggleCam}
              onToggleEditor={toggleEditor}
              onLeaveCall={() => {
                const closeMeeting = async () => {
                  try {
                    if (isHost && meetingId) {
                      await fetch(`${import.meta.env.VITE_API_URL}/user/meetings/${meetingId}/close`, {
                        method: "POST",
                        credentials: "include",
                      });
                    }
                  } finally {
                    leaveCall();
                    navigate("/dashboard");
                  }
                };
                void closeMeeting();
              }}
            />
          </div>
        </main>
        {isChatOpen && (
          <div className="w-75 shrink-0">
            <ChatSideBar
              socket={socket}
              meetingCode={meetingCode}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
