import {
  LayoutDashboard,
  Video,
  LogIn,
  CalendarDays,
  History,
  Settings,
  LogOut,
  CircleHelp,
  Info,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const Sidebar = () => {
  const menuItems = [
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
      path: "/join-meeting",
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

  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const closeSidebar = () => setMobileOpen(false);

  return (
    <>
      <button
        type="button"
        aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
        onClick={() => setMobileOpen((value) => !value)}
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-lg border border-[#e8e8ef] bg-white text-[#151735] shadow-sm md:hidden"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[250px] -translate-x-full flex-col border-r border-[#e8e8ef] bg-white px-4 py-6 shadow-lg transition-transform duration-200 md:translate-x-0 md:shadow-none ${
          mobileOpen ? "translate-x-0" : ""
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-2 px-4 pb-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#5b3fd6] text-white">
              <Video size={17} />
            </div>

            <span className="text-2xl font-bold text-[#151735]">NextMeet</span>
          </div>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={closeSidebar}
            className="rounded-md p-1 text-[#30344f] hover:bg-[#f5f2ff] md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={closeSidebar}
                className={`flex h-12 items-center gap-3.5 rounded-lg px-4 text-[15px] transition ${
                  isActive
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
          <Link
            to="/about"
            onClick={closeSidebar}
            className="flex h-12 items-center gap-3.5 rounded-lg px-4 text-left text-[15px] text-[#30344f] transition hover:bg-[#f5f2ff] hover:text-[#5b3fd6]"
          >
            <CircleHelp size={20} />
            <span>About</span>
          </Link>

          <Link
            to="/terms"
            onClick={closeSidebar}
            className="flex h-12 items-center gap-3.5 rounded-lg px-4 text-left text-[15px] text-[#30344f] transition hover:bg-[#f5f2ff] hover:text-[#5b3fd6]"
          >
            <Info size={20} />
            <span>Terms & Conditions</span>
          </Link>

          <button
            onClick={() => {
              closeSidebar();
              void handleLogout();
            }}
            className="flex h-12 items-center gap-3.5 rounded-lg px-4 text-left text-[15px] text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
