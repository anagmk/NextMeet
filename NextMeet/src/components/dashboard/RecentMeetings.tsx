
import MeetingCard from "./MeetingCard";

const RecentMeetings = () => {
  return (
    <section className="rounded-2xl bg-white px-5 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="mb-3 flex items-start justify-between">
        <h2 className="text-sm font-semibold leading-4 text-gray-800">
          Recent
          <br />
          Meetings
        </h2>

        <button className="text-[10px] text-[#5146e5]">View all</button>
      </div>

      <MeetingCard
        title="Product Sync — Design Team"
        date="Today"
        time="9:30 AM"
        duration="45 min"
        action="Rejoin"
        actionStyle="primary"
      />

      <MeetingCard
        title="1:1 with Ashika"
        date="Yesterday"
        time="4:00 PM"
        duration="20 min"
        action="Details"
      />

      <MeetingCard
        title="Client Onboarding Call"
        date="Yesterday"
        time="11:00 AM"
        duration="1h 10 min"
        action="Details"
      />

      <MeetingCard
        title="Sprint Retro"
        date="Jun 30"
        time="3:00 PM"
        duration="35 min"
        action="Details"
      />
    </section>
  );
};

export default RecentMeetings;