import type { RefObject } from "react";

type VideoPanelProps = {
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
  height: number;
  isEditorFullscreen: boolean;
  onResizeStart: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export default function VideoPanel({
  localVideoRef,
  remoteVideoRef,
  height,
  isEditorFullscreen,
  onResizeStart,
}: VideoPanelProps) {
  return (
    <>
      <div
        className="flex items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,rgba(81,70,229,0.18),transparent_35%)] p-6"
        style={{
          height: isEditorFullscreen ? "10px" : `${height}px`,
          minHeight: isEditorFullscreen ? "140px" : "10px",
          transition: "height 0.2s ease",
        }}
      >
        <video ref={remoteVideoRef} autoPlay playsInline className="max-h-full max-w-[45%] rounded-2xl border border-white/15 bg-[#141923]" />
        <video ref={localVideoRef} autoPlay playsInline muted className="max-h-full max-w-[45%] rounded-2xl border border-white/15 bg-[#141923]" />
      </div>
      <div role="separator" aria-label="Resize video and editor panes" className="h-2 cursor-row-resize bg-transparent" onMouseDown={onResizeStart} />
    </>
  );
}
