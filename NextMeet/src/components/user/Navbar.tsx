import { Search, Sun, Bell, Plus, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <header className="flex h-20 items-center justify-between border-b border-[#e8e8ef] bg-white px-7 pl-10">
      {/* Search */}
      <div className="flex h-[46px] w-[355px] items-center gap-2.5 rounded-lg border border-[#dedee8] px-3.5 text-[#8589a2]">
        <Search size={20} />

        <input
          type="text"
          placeholder="Search meetings..."
          className="flex-1 bg-transparent text-sm text-[#30344f] outline-none placeholder:text-[#999caf]"
        />

        <span className="text-xs text-[#999caf]">Ctrl + K</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-[18px]">
        {/* Theme */}
        <button
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#dedee8] bg-white text-[#30344f] transition hover:border-[#cfc5ff] hover:text-[#5b3fd6]"
          title="Change theme"
        >
          <Sun size={20} />
        </button>

        {/* New Meeting */}
        <button
          className="flex h-11 items-center gap-2 rounded-lg bg-[#5b3fd6] px-[18px] text-sm text-white transition hover:bg-[#4d32c5]"
          onClick={() => navigate("/schedule-meeting")}
        >
          <Plus size={19} />

          <span>New Meeting</span>
        </button>

        {/* Notification */}
        <button className="relative flex h-11 w-11 items-center justify-center rounded-lg text-[#30344f]">
          <Bell size={21} />

          <span className="absolute right-1 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5b3fd6] px-1 text-[10px] text-white">
            3
          </span>
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2">
          <img
            src="https://i.pravatar.cc/100?img=12"
            alt="Profile"
            className="h-[42px] w-[42px] rounded-full object-cover"
          />

          <ChevronDown size={16} className="text-[#555b79]" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
