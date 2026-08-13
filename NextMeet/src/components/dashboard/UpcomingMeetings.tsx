
interface UpcomingProps {
  day: string;
  date: string;
  title: string;
  time: string;
  attendees: number;
  action: string;
}

const UpcomingItem = ({
  day,
  date,
  title,
  time,
  attendees,
  action,
}: UpcomingProps) => {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl bg-[#eef0ff] text-[#5146e5]">
          <span className="text-[8px] font-medium">{day}</span>
          <span className="text-[12px] font-bold leading-3">{date}</span>
        </div>

        <div>
          <h3 className="text-[12px] font-medium text-gray-800">{title}</h3>

          <p className="text-[10px] text-gray-400">
            {time} · {attendees} attendees
          </p>
        </div>
      </div>

      <button className="text-[10px] text-gray-700">{action}</button>
    </div>
  );
};

const UpcomingMeetings = () => {
  return (
    <section className="rounded-2xl bg-white px-5 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="mb-3 flex items-start justify-between">
        <h2 className="text-sm font-semibold leading-4 text-gray-800">
          Upcoming
          <br />
          Meetings
        </h2>

        <button className="text-[10px] text-[#5146e5]">
          View calendar
        </button>
      </div>

      <UpcomingItem
        day="JUN"
        date="05"
        title="Weekly Team Standup"
        time="Today, 6:00 PM"
        attendees={5}
        action="Start"
      />

      <UpcomingItem
        day="JUL"
        date="07"
        title="Investor Update Call"
        time="Tue, 10:00 AM"
        attendees={3}
        action="Details"
      />

      <UpcomingItem
        day="JUL"
        date="09"
        title="Badminton Club Planning"
        time="Tue, 2:00 PM"
        attendees={8}
        action="Details"
      />

      <UpcomingItem
        day="JUL"
        date="12"
        title="Freelance Project Kickoff"
        time="Fri, 4:00 PM"
        attendees={2}
        action="Details"
      />
    </section>
  );
};

export default UpcomingMeetings;
