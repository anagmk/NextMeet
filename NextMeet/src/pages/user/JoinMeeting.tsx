import Sidebar from "../../components/user/Sidebar";
import Navbar from "../../components/user/Navbar";
import JoinMeetingForm from "../../components/user/JoinMeeting";

const JoinMeeting = () => {
  return (
    <div className="min-h-screen bg-[#fafafd]">

      <Sidebar />

      <div className="ml-[250px]">

        <Navbar />

        <main>
          <JoinMeetingForm />
        </main>

      </div>

    </div>
  );
};

export default JoinMeeting;