
import Navbar from "../../components/user/Navbar";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
// import RecentMeetings from "../../components/dashboard/RecentMeetings";
// import UpcomingMeetings from "../../components/dashboard/UpcomingMeetings";
import Sidebar from "../../components/user/Sidebar";
import DashboardContent from "../../components/dashboard/DashboardMain";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const notification = location.state?.notification as string | undefined;

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => navigate(location.pathname, { replace: true, state: null }), 2500);
    return () => window.clearTimeout(timer);
  }, [location.pathname, navigate, notification]);

  return (
    <div className="min-h-screen bg-[#f8f8fc]">
      {notification && (
        <div className="fixed right-5 top-5 z-50 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 shadow-lg" role="alert">
          {notification}
        </div>
      )}
      <Sidebar />

      <div className="min-h-screen md:ml-[250px]">
        <Navbar />

        <main className="px-3 py-3 md:px-6">
          <DashboardContent />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;