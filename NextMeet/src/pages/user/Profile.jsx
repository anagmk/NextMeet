import Sidebar from "../../components/user/Sidebar";
import Navbar from "../../components/user/Navbar";
import ProfilePage from "../../components/user/ProfilePage";

const Profile = () => {
  return (
    <div className="min-h-screen bg-[#fafafd]">

      <Sidebar />

      <div className="ml-[250px]">

        <Navbar />

        <main>
          <ProfilePage />
        </main>

      </div>

    </div>
  );
};

export default Profile;