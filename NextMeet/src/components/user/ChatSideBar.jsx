import { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { useUser } from "../../context/UserContext";

const ChatSideBar = ({ onClose = () => {}, socket, meetingCode }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!meetingCode) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/user/meetings/${meetingCode}/messages`, {
          credentials: "include",
        });

        if (!res.ok) {
          console.error("Failed to fetch chat history", res.status);
          return;
        }

        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadMessages();
  }, [meetingCode]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (payload) => {
      setMessages((prev) => {
        const exists = prev.some((msg) => {
          const existingId = msg._id || msg.id;
          const incomingId = payload._id || payload.id;
          return existingId && incomingId && existingId === incomingId;
        });

        if (exists) return prev;
        return [...prev, payload];
      });
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;

    socket.emit("send-message", { meetingCode, message: input.trim() });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#15151d] text-white shadow-2xl">

      {/* Header */}
      <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-white/5 px-4">
        <h2 className="text-sm font-medium">Chat</h2>

        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#858590] transition hover:bg-white/5 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((msg, index) => {
          const senderId = msg.senderId?._id || msg.senderId;
          const isOwn = String(senderId) === String(user?._id);
          const senderName = msg.sender || msg.senderId?.name || "Unknown";
          const timestamp = msg.timestamp || msg.createdAt;
          const time = new Date(timestamp).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          });

          return (
            <div key={msg._id || msg.id || index}>
              <div className={`mb-1.5 text-[10px] text-[#858590] ${isOwn ? "text-right" : ""}`}>
                {isOwn ? "You" : senderName} · {time}
              </div>

              <div
                className={
                  isOwn
                    ? "ml-auto w-fit max-w-[225px] rounded-lg rounded-tr-sm bg-[#5146e5] px-3 py-2.5 text-[12px] leading-[1.4] text-white"
                    : "w-fit max-w-[225px] rounded-lg rounded-tl-sm bg-[#282832] px-3 py-2.5 text-[12px] leading-[1.4] text-[#e5e5e8]"
                }
              >
                {msg.message || msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="shrink-0 border-t border-white/5 p-3">
        <div className="flex items-center gap-2 rounded-xl bg-[#30303a] px-3 py-1.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-w-0 flex-1 bg-transparent py-2 text-[12px] text-white outline-none placeholder:text-[#96969f]"
          />

          <button
            type="button"
            onClick={handleSend}
            className="flex h-7 w-7 shrink-0 items-center justify-center text-[#d7d7dc] transition hover:text-white"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

    </aside>
  );
};

export default ChatSideBar;