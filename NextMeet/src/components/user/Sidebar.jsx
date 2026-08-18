import {
  User,
  LayoutDashboard,
  Video,
  LogIn,
  CalendarDays,
  History,
  Settings,
  LogOut,
  CircleHelp,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    {
      name: "Profile",
      icon: User,
      path: "/profile",
      active: true,
    },
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Meetings",
      icon: Video,
      path: "/meetings",
    },
    {
      name: "Join Meeting",
      icon: LogIn,
      path: "/join",
    },
    {
      name: "Scheduler",
      icon: CalendarDays,
      path: "/create-meeting",
    },
    {
      name: "History",
      icon: History,
      path: "/history",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[250px] flex-col border-r border-[#e8e8ef] bg-white px-4 py-6">

      {/* Logo */}
      <div className="flex items-center gap-2 px-4 pb-8">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#5b3fd6] text-white">
          <Video size={17} />
        </div>

        <span className="text-2xl font-bold text-[#151735]">
          NextMeet
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex h-12 items-center gap-3.5 rounded-lg px-4 text-[15px] transition ${
                item.active
                  ? "bg-[#f1edff] font-semibold text-[#5b3fd6]"
                  : "text-[#30344f] hover:bg-[#f5f2ff] hover:text-[#5b3fd6]"
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}

      </nav>

      {/* Bottom */}
      <div className="mt-auto flex flex-col gap-1">

        <button className="flex h-12 items-center gap-3.5 rounded-lg px-4 text-left text-[15px] text-red-600 transition hover:bg-red-50">
          <LogOut size={20} />
          <span>Logout</span>
        </button>

        <button className="flex h-12 items-center gap-3.5 rounded-lg px-4 text-left text-[15px] text-[#30344f] transition hover:bg-[#f5f2ff] hover:text-[#5b3fd6]">
          <CircleHelp size={20} />
          <span>Help & Support</span>
        </button>

        <button className="flex h-12 items-center gap-3.5 rounded-lg px-4 text-left text-[15px] text-[#30344f] transition hover:bg-[#f5f2ff] hover:text-[#5b3fd6]">
          <Info size={20} />
          <span>About NextMeet</span>
        </button>

      </div>

    </aside>
  );
};

export default Sidebar;