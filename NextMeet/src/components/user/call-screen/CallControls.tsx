import {
  Code2,
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
  Wrench,
} from "lucide-react";
import { useState } from "react";

type CallControlsProps = {
  micOn: boolean;
  camOn: boolean;
  isEditorOpen: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleEditor: () => void;
  onLeaveCall: () => void;
};

export default function CallControls({
  micOn,
  camOn,
  isEditorOpen,
  onToggleMic,
  onToggleCam,
  onToggleEditor,
  onLeaveCall,
}: CallControlsProps) {
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const toggleEditor = () => {
    onToggleEditor();
    setIsToolsOpen(false);
  };

  return (
    <div className="relative mt-auto flex justify-center gap-4 border-t border-white/10 px-5 py-4">
      <button
        onClick={onToggleMic}
        aria-label="Toggle microphone"
        className={`flex h-11 w-11 items-center justify-center rounded-full transition ${micOn ? "bg-[#282832] text-white hover:bg-[#33333f]" : "bg-red-500/90 text-white hover:bg-red-500"}`}
      >
        {micOn ? <Mic size={18} /> : <MicOff size={18} />}
      </button>
      <button
        onClick={onToggleCam}
        aria-label="Toggle camera"
        className={`flex h-11 w-11 items-center justify-center rounded-full transition ${camOn ? "bg-[#282832] text-white hover:bg-[#33333f]" : "bg-red-500/90 text-white hover:bg-red-500"}`}
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
              onClick={toggleEditor}
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
        onClick={onLeaveCall}
        aria-label="Leave call"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700"
      >
        <PhoneOff size={18} />
      </button>
    </div>
  );
}
