
import Navbar from "../../components/user/Navbar";
// import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
// import RecentMeetings from "../../components/dashboard/RecentMeetings";
// import UpcomingMeetings from "../../components/dashboard/UpcomingMeetings";
import Sidebar from "../../components/user/Sidebar";
import DashboardContent from "../../components/dashboard/DashboardMain";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#f8f8fc]">
      <Sidebar />

      <div className="ml-[250px] min-h-screen">
        <Navbar />

        <main className="px-3 py-3 md:px-6">
          <DashboardContent />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;