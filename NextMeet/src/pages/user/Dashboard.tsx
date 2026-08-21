
import DashboardNavbar from "../../components/dashboard/DashboardNavbar";
import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
import RecentMeetings from "../../components/dashboard/RecentMeetings";
import UpcomingMeetings from "../../components/dashboard/UpcomingMeetings";
import Sidebar from "../../components/user/Sidebar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#f8f8fc]">
      <Sidebar />

      <div className="ml-[250px] min-h-screen">
        <DashboardNavbar />

        <main className="px-3 py-3 md:px-6">
          <WelcomeBanner />

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <RecentMeetings />
            <UpcomingMeetings />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;