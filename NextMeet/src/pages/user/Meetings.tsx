import Sidebar from "../../components/user/Sidebar";
import Navbar from "../../components/user/Navbar";
import AllMeetingsList from "../../components/user/AllMeetings";

const AllMeetings = () => {
  return (
    <div className="min-h-screen bg-[#fafafd]">

      <Sidebar />

      <div className="ml-[250px]">

        <Navbar />

        <main>
          <AllMeetingsList />
        </main>

      </div>

    </div>
  );
};

export default AllMeetings;