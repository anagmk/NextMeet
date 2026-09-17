import Sidebar from "../../components/user/Sidebar";
import Navbar from "../../components/user/Navbar";
import MeetingHistory from "../../components/user/MeetingHistory";
import AdRail from "../../components/user/AdRail";

const JoinMeeting = () => {
  return (
    <div className="min-h-screen bg-[#fafafd]">
      <Sidebar />

      <div className="md:ml-[250px]">
        <Navbar />
        <div className="history-page min-h-screen bg-[#F8F8FC] p-4 text-dark sm:p-6 md:p-10">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-8 lg:flex-row lg:items-start">
            <main className="min-w-0 max-w-3xl flex-1">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold">Meeting History</h1>
                <p className="mt-1 text-sm text-[#8b8f9d]">
                  Meetings you've attended or hosted.
                </p>
              </div>
              <MeetingHistory />
            </main>
            <AdRail />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinMeeting;
