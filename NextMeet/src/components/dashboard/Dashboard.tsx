
import DashboardNavbar from "./DashboardNavbar";
import WelcomeBanner from "./WelcomeBanner";
import RecentMeetings from "./RecentMeetings";
import UpcomingMeetings from "./UpcomingMeetings";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#f8f8fc]">
      <DashboardNavbar />

      <main className="px-3 py-3 md:px-6">
        <WelcomeBanner />

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <RecentMeetings />
          <UpcomingMeetings />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;