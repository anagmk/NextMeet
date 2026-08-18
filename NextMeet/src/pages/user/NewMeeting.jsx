import Sidebar from "../../components/user/Sidebar";
import Navbar from "../../components/user/Navbar";
import CreateMeetingPage from "../../components/user/CreateMeetingPage";

const NewMeeting = () => {
  return (
    <div className="min-h-screen bg-[#fafafd]">

      <Sidebar />

      <div className="ml-[250px]">

        <Navbar />

        <main>
          <CreateMeetingPage />
        </main>

      </div>

    </div>
  );
};

export default NewMeeting;