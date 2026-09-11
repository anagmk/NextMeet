import Sidebar from "../../components/user/Sidebar";
import Navbar from "../../components/user/Navbar";
import ReportPage from "../../pages/user/ReportPage";

const ReportPageUi = () => {
  return (
    <div className="min-h-screen bg-[#fafafd]">

      <Sidebar />

      <div className="ml-[250px]">

        <Navbar />

        <main>
          <ReportPage />
        </main>

      </div>

    </div>
  );
};

export default ReportPageUi;