
interface MeetingCardProps {
  title: string;
  date: string;
  time: string;
  duration?: string;
  action: string;
  actionStyle?: "normal" | "primary";
}

const MeetingCard = ({
  title,
  date,
  time,
  duration,
  action,
  actionStyle = "normal",
}: MeetingCardProps) => {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef0ff]">
          <span aria-hidden="true" className="text-sm text-gray-700">▶</span>
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-[12px] font-medium text-gray-800">
            {title}
          </h3>

          <p className="text-[10px] text-gray-400">
            {date} · {time}
            {duration && ` · ${duration}`}
          </p>
        </div>
      </div>

      <button
        className={`ml-3 shrink-0 text-[10px] ${
          actionStyle === "primary"
            ? "text-[#5146e5]"
            : "text-gray-700"
        }`}
      >
        {action}
      </button>
    </div>
  );
};

export default MeetingCard;
