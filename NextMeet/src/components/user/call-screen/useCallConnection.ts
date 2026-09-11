import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { io, type Socket } from "socket.io-client";

const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

type GeneratedQuestion = {
  questionId: string;
  title: string;
  description: string;
  starterCode: string;
  language: string;
  functionName: string;
  testCases: { args: string[]; expectedOutput: string; isHidden: boolean }[];
};

type UseCallConnectionOptions = {
  meetingCode?: string;
  initialMicOn: boolean;
  initialCamOn: boolean;
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
  onRemoteCodeChange: (code: string) => void;
  onQuestionGenerated: (question: GeneratedQuestion) => void;
};

export default function useCallConnection({ meetingCode, initialMicOn, initialCamOn, localVideoRef, remoteVideoRef, onRemoteCodeChange, onQuestionGenerated }: UseCallConnectionOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [joinError, setJoinError] = useState("");
  const [micOn, setMicOn] = useState(initialMicOn);
  const [camOn, setCamOn] = useState(initialCamOn);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteSocketIdRef = useRef<string | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidate[]>([]);

  const ensureLocalStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getAudioTracks().forEach((track) => { track.enabled = initialMicOn; });
    stream.getVideoTracks().forEach((track) => { track.enabled = initialCamOn; });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  }, [initialCamOn, initialMicOn, localVideoRef]);

  const createPeerConnection = useCallback((remoteSocketId: string, socketInstance: Socket) => {
    if (peerConnectionRef.current && remoteSocketIdRef.current === remoteSocketId) return peerConnectionRef.current;
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);
    const stream = localStreamRef.current;
    stream?.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
    peerConnection.ontrack = (event) => {
      if (!remoteVideoRef.current) return;
      if (event.streams[0]) { remoteVideoRef.current.srcObject = event.streams[0]; return; }
      const remoteStream = remoteVideoRef.current.srcObject instanceof MediaStream ? remoteVideoRef.current.srcObject : new MediaStream();
      remoteStream.addTrack(event.track);
      remoteVideoRef.current.srcObject = remoteStream;
    };
    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === "failed" || peerConnection.connectionState === "closed") console.warn("Peer connection ended for:", remoteSocketId);
    };
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) socketInstance.emit("webrtc-ice-candidate", { meetingCode, candidate: event.candidate, to: remoteSocketId });
    };
    remoteSocketIdRef.current = remoteSocketId;
    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [meetingCode, remoteVideoRef]);

  useEffect(() => {
    if (!meetingCode) return;
    const joinMeeting = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/meetings/join`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meetingCode }) });
        const data = await response.json().catch(() => ({}));
        if (!response.ok && data.message !== "User already joined the meeting") throw new Error(data.message || "Failed to join meeting");
      } catch (error) { setJoinError(error instanceof Error ? error.message : "Unable to join this meeting."); }
    };
    void joinMeeting();
  }, [meetingCode]);

  useEffect(() => {
    if (!meetingCode) return;
    const newSocket = io(import.meta.env.VITE_SERVER_URL, { withCredentials: true });
    newSocket.on("connect", () => { console.log("Connected to server:", newSocket.id); newSocket.emit("join-meeting", meetingCode); });
    newSocket.on("user-joined", async ({ socketId }: { socketId: string }) => {
      if (!socketId || socketId === newSocket.id) return;
      const stream = await ensureLocalStream();
      const peerConnection = createPeerConnection(socketId, newSocket);
      if (peerConnection.signalingState === "stable") stream.getTracks().forEach((track) => { if (!peerConnection.getSenders().some((sender) => sender.track === track)) peerConnection.addTrack(track, stream); });
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      newSocket.emit("webrtc-offer", { meetingCode, offer, to: socketId });
    });
    newSocket.on("webrtc-offer", async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      if (!from || from === newSocket.id) return;
      const stream = await ensureLocalStream();
      const peerConnection = createPeerConnection(from, newSocket);
      if (peerConnection.signalingState === "stable") stream.getTracks().forEach((track) => { if (!peerConnection.getSenders().some((sender) => sender.track === track)) peerConnection.addTrack(track, stream); });
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      for (const candidate of pendingIceCandidatesRef.current) await peerConnection.addIceCandidate(candidate);
      pendingIceCandidatesRef.current = [];
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      newSocket.emit("webrtc-answer", { meetingCode, answer, to: from });
    });
    newSocket.on("webrtc-answer", async ({ answer, from }: { answer: RTCSessionDescriptionInit; from: string }) => {
      if (!answer || !peerConnectionRef.current) return;
      remoteSocketIdRef.current = from || remoteSocketIdRef.current;
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      for (const candidate of pendingIceCandidatesRef.current) await peerConnectionRef.current.addIceCandidate(candidate);
      pendingIceCandidatesRef.current = [];
    });
    newSocket.on("webrtc-ice-candidate", async ({ candidate, from }: { candidate: RTCIceCandidateInit; from: string }) => {
      if (!candidate || !peerConnectionRef.current) return;
      remoteSocketIdRef.current = from || remoteSocketIdRef.current;
      try {
        const iceCandidate = new RTCIceCandidate(candidate);
        if (!peerConnectionRef.current.remoteDescription) { pendingIceCandidatesRef.current.push(iceCandidate); return; }
        await peerConnectionRef.current.addIceCandidate(iceCandidate);
      } catch (error) { console.error("Failed to add ICE candidate:", error); }
    });
    newSocket.on("code-change", ({ code }: { code: string }) => onRemoteCodeChange(code));
    newSocket.on("question-generated", ({ question }: { question: GeneratedQuestion }) => onQuestionGenerated(question));
    setSocket(newSocket);
    return () => { peerConnectionRef.current?.close(); newSocket.disconnect(); };
  }, [createPeerConnection, ensureLocalStream, meetingCode, onRemoteCodeChange, onQuestionGenerated]);

  useEffect(() => {
    void ensureLocalStream().catch((error) => console.error("Failed to get local media:", error));
    return () => localStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, [ensureLocalStream]);

  const toggleMic = () => { const track = localStreamRef.current?.getAudioTracks()[0]; if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); } };
  const toggleCam = () => { const track = localStreamRef.current?.getVideoTracks()[0]; if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); } };
  const leaveCall = () => { localStreamRef.current?.getTracks().forEach((track) => track.stop()); peerConnectionRef.current?.close(); peerConnectionRef.current = null; socket?.disconnect(); };

  return { socket, joinError, micOn, camOn, toggleMic, toggleCam, leaveCall };
}
