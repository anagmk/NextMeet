// JoinLobby.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, ArrowLeft } from "lucide-react";

export default function JoinLobby() {
  const { meetingCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const initialCamOn = location.state?.camOn ?? true;
  const initialMicOn = location.state?.micOn ?? true;

  const [meeting, setMeeting] = useState(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [error, setError] = useState("");

  const [camOn, setCamOn] = useState(initialCamOn);
  const [micOn, setMicOn] = useState(initialMicOn);
  const [mediaError, setMediaError] = useState("");
  const [joining, setJoining] = useState(false);

  // 1. Fetch meeting info (does NOT join yet)
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await fetch(`/api/user/meetings/code/${meetingCode}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Meeting not found");
        setMeeting(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingMeeting(false);
      }
    };
    fetchMeeting();
  }, [meetingCode]);

  // 2. Start camera/mic preview
  useEffect(() => {
    async function startLocalMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // apply lobby preferences right away
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
      } catch (err) {
        console.error("Failed to get local media:", err);
      }
    }
    startLocalMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // 3. Toggle camera on/off (disables track, doesn't destroy stream)
  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    }
  };

  // 4. Toggle mic on/off
  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  // 5. Join the meeting, then navigate into the call
  const handleJoin = async () => {
    setJoining(true);
    setError("");
    try {
      const res = await fetch("/api/user/meetings/join", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingCode }),
      });
      const data = await res.json();
      if (!res.ok && data.message !== "User already joined the meeting") {
        throw new Error(data.message || "Failed to join meeting");
      }

      // stop preview stream here — the call screen will request its own
      localStreamRef.current?.getTracks().forEach((track) => track.stop());

      navigate(`/meet/${meetingCode}`, {
        state: { skipLobby: true, camOn, micOn },
      });
    } catch (err) {
      setError(err.message);
      setJoining(false);
    }
  };

  if (loadingMeeting) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Loading meeting...
      </div>
    );
  }

  if (error && !meeting) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-red-600">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-[#5b3fd6]"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8fc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#5b3fd6] hover:bg-[#f0edff]"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1 className="mb-1 text-2xl font-bold text-[#171a3a]">
          {meeting.title}
        </h1>
        <p className="mb-6 text-sm text-[#656982]">
          Hosted by {meeting.hostId?.name || "Unknown"}
        </p>

        {/* Video preview */}
        <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl bg-black">
          {camOn ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
              Camera is off
            </div>
          )}

          {mediaError && (
            <div className="absolute inset-x-0 top-0 bg-red-600/90 px-4 py-2 text-center text-xs text-white">
              {mediaError}
            </div>
          )}
        </div>

        {/* Camera / mic toggle controls */}
        <div className="mb-6 flex justify-center gap-4">
          <button
            onClick={toggleMic}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
              micOn ? "bg-[#eeeaff] text-[#5b3fd6]" : "bg-red-100 text-red-600"
            }`}
          >
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={toggleCam}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
              camOn ? "bg-[#eeeaff] text-[#5b3fd6]" : "bg-red-100 text-red-600"
            }`}
          >
            {camOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
        </div>

        {error && (
          <p className="mb-4 text-center text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleJoin}
          disabled={joining}
          className="mx-auto block h-12 w-full max-w-xs rounded-lg bg-[#5b3fd6] text-sm font-medium text-white shadow-sm transition hover:bg-[#4d32c5] disabled:opacity-50"
        >
          {joining ? "Joining..." : "Join meeting"}
        </button>
      </div>
    </div>
  );
}
