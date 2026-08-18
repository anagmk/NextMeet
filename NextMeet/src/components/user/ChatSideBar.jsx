import {
  X,
  Send,
  MessageCircle,
} from "lucide-react";

const MeetingSidebar = ({ onClose }) => {
  return (
    <aside className="flex h-full w-[255px] flex-col bg-[#15151d] text-white">

      {/* Header */}
      <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-white/5 px-4">
        <h2 className="text-sm font-medium">
          Chat
        </h2>

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

        {/* Message */}
        <div>
          <div className="mb-1.5 text-[10px] text-[#858590]">
            Rahul Menon · 9:41
          </div>

          <div className="max-w-[225px] rounded-lg rounded-tl-sm bg-[#282832] px-3 py-2.5 text-[12px] leading-[1.4] text-[#e5e5e8]">
            Can everyone see the shared screen okay?
          </div>
        </div>

        {/* Message */}
        <div>
          <div className="mb-1.5 text-[10px] text-[#858590]">
            Ashika K · 9:42
          </div>

          <div className="w-fit max-w-[225px] rounded-lg rounded-tl-sm bg-[#282832] px-3 py-2.5 text-[12px] leading-[1.4] text-[#e5e5e8]">
            Yep, looks good 👍
          </div>
        </div>

        {/* Own message */}
        <div>
          <div className="mb-1.5 text-right text-[10px] text-[#858590]">
            You · 9:43
          </div>

          <div className="ml-auto max-w-[225px] rounded-lg rounded-tr-sm bg-[#5146e5] px-3 py-2.5 text-[12px] leading-[1.4] text-white">
            Cool, starting with the reverse linked list problem now.
          </div>
        </div>

        {/* Message */}
        <div>
          <div className="mb-1.5 text-[10px] text-[#858590]">
            Rahul Menon · 9:45
          </div>

          <div className="max-w-[225px] rounded-lg rounded-tl-sm bg-[#282832] px-3 py-2.5 text-[12px] leading-[1.4] text-[#e5e5e8]">
            Nice, try to also handle the empty list edge case.
          </div>
        </div>

        {/* Own message */}
        <div>
          <div className="mb-1.5 text-right text-[10px] text-[#858590]">
            You · 9:46
          </div>

          <div className="ml-auto max-w-[225px] rounded-lg rounded-tr-sm bg-[#5146e5] px-3 py-2.5 text-[12px] leading-[1.4] text-white">
            On it — while loop already returns null for that case.
          </div>
        </div>

      </div>

      {/* Message Input */}
      <div className="shrink-0 border-t border-white/5 p-3">

        <div className="flex items-center gap-2 rounded-xl bg-[#30303a] px-3 py-1.5">

          <input
            type="text"
            placeholder="Type a message..."
            className="min-w-0 flex-1 bg-transparent py-2 text-[12px] text-white outline-none placeholder:text-[#96969f]"
          />

          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center text-[#d7d7dc] transition hover:text-white"
          >
            <Send size={18} />
          </button>

        </div>

      </div>

    </aside>
  );
};

export default MeetingSidebar;