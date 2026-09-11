import Sidebar from "../../components/user/Sidebar";
import Navbar from "../../components/user/Navbar";
import MeetingHistory from "../../components/user/MeetingHistory";

const JoinMeeting = () => {
  return (
    <div className="min-h-screen bg-[#fafafd]">
      <Sidebar />

      <div className="md:ml-[250px]">
        <Navbar />
        <div className="min-h-screen bg-[#F8F8FC] p-4 text-dark sm:p-6 md:p-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">Meeting History</h1>
              <p className="mt-1 text-sm text-[#8b8f9d]">
                Meetings you've attended or hosted.
              </p>
            </div>
            <MeetingHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinMeeting;
