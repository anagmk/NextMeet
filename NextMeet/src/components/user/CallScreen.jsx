import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import ChatSideBar from "./ChatSideBar";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function CallScreen() {
  const { meetingCode } = useParams();
  const [socket, setSocket] = useState(null);
  const [joinError, setJoinError] = useState("");
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteSocketIdRef = useRef(null);

  const ensureLocalStream = async () => {
    if (localStreamRef.current) return localStreamRef.current;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
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
        setJoinError(error.message || "Unable to join this meeting.");
      }
    };
    autoJoinMeeting();
  }, [meetingCode]);

  // Create the peer connection once, reused throughout the call
  function createPeerConnection(remoteSocketId, socketInstance) {
    if (peerConnectionRef.current && remoteSocketIdRef.current === remoteSocketId) {
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
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
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

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        console.warn("Peer connection ended for:", remoteSocketId);
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
    newSocket.on("user-joined", async ({ socketId }) => {
      console.log("Another user joined:", socketId);

      if (!socketId || socketId === newSocket.id) return;

      const stream = await ensureLocalStream();
      const pc = createPeerConnection(socketId, newSocket);
      if (stream && !pc.signalingState || pc.signalingState === "stable") {
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
    newSocket.on("webrtc-offer", async ({ offer, from }) => {
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

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      newSocket.emit("webrtc-answer", {
        meetingCode,
        answer,
        to: from,
      });
    });

    // Our offer got answered
    newSocket.on("webrtc-answer", async ({ answer, from }) => {
      if (!answer || !peerConnectionRef.current) return;
      remoteSocketIdRef.current = from || remoteSocketIdRef.current;
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    // ICE candidates trickling in from the peer
    newSocket.on("webrtc-ice-candidate", async ({ candidate, from }) => {
      if (!candidate || !peerConnectionRef.current) return;
      remoteSocketIdRef.current = from || remoteSocketIdRef.current;
      try {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error("Failed to add ICE candidate:", err);
      }
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
          </div>
        </main>

        <div className="w-[300px] shrink-0">
          <ChatSideBar socket={socket} meetingCode={meetingCode} onClose={() => {}} />
        </div>
      </div>
    </div>
  );
}