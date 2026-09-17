import { Sun, Bell, Plus, ChevronDown, Monitor, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { getThemePreference, onThemePreferenceChange, setThemePreference, type AppTheme } from "../../lib/theme";

type NotificationItem = {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  meetingCode?: string;
  meetingId?: string;
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<AppTheme>(getThemePreference);

  useEffect(() => onThemePreferenceChange(setTheme), []);

  const cycleTheme = () => {
    const nextTheme: AppTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setThemePreference(nextTheme);
    setTheme(nextTheme);
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/notifications`,
        {
          credentials: "include",
        },
      );
      const data = await res.json().catch(() => ({ notifications: [] }));
      if (!res.ok) return;
      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : [],
      );
    } catch (error) {
      console.error("Fetch notifications error:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/notifications`,
          {
            credentials: "include",
          },
        );
        const data = await res.json().catch(() => ({ notifications: [] }));

        if (!isMounted || !res.ok) return;
        setNotifications(
          Array.isArray(data.notifications) ? data.notifications : [],
        );
      } catch (error) {
        console.error("Fetch notifications error:", error);
      }
    };

    void loadNotifications();
    const timer = window.setInterval(() => {
      void loadNotifications();
    }, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const onOpenNotification = async (notification: NotificationItem) => {
    setOpen(false);

    if (notification.meetingCode) {
      navigate(`/meetings/${notification.meetingCode}/report`);
    }

    if (!notification.isRead) {
      try {
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/notifications/${notification._id}/read`,
          {
            method: "PATCH",
            credentials: "include",
          },
        );
      } catch (error) {
        console.error("Mark notification read error:", error);
      }
      await fetchNotifications();
    }
  };

  return (
    <header className="flex h-20 items-center justify-end border-b border-[#e8e8ef] bg-white px-4 sm:px-5 md:px-7 md:pl-10">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-[18px]">
        <button
          type="button"
          onClick={cycleTheme}
          className="hidden h-10 w-10 items-center justify-center rounded-lg border border-[#dedee8] bg-white text-[#30344f] transition hover:border-[#cfc5ff] hover:text-[#5b3fd6] sm:flex"
          title={`Theme: ${theme}. Click to switch.`}
          aria-label={`Theme: ${theme}. Click to switch.`}
        >
          {theme === "light" ? <Sun size={18} /> : theme === "dark" ? <Moon size={18} /> : <Monitor size={18} />}
        </button>

        <button
          className="flex h-10 items-center gap-1.5 rounded-lg bg-[#5b3fd6] px-3 text-sm font-medium text-white transition hover:bg-[#4d32c5] sm:gap-2 sm:px-[18px]"
          onClick={() => navigate("/create-meeting")}
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Meeting</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((previous) => !previous)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#30344f]"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5b3fd6] px-1 text-[10px] text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-[52px] z-20 w-[300px] rounded-2xl border border-[#e8e8ef] bg-white p-3 shadow-xl sm:w-[320px]">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#171a3a]">
                  Notifications
                </span>
                <span className="text-xs text-[#85899f]">
                  {unreadCount} unread
                </span>
              </div>

              <div className="max-h-[320px] space-y-2 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="rounded-xl bg-[#fafafd] px-3 py-4 text-center text-xs text-[#85899f]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification._id}
                      type="button"
                      onClick={() => onOpenNotification(notification)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                        notification.isRead
                          ? "border-[#edf0f7] bg-[#fafafd] text-[#4d5369]"
                          : "border-[#e5e0ff] bg-[#f5f2ff] text-[#221d38]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">
                          {notification.message}
                        </p>
                        {!notification.isRead && (
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#5b3fd6]" />
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-[#85899f]">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          className="flex items-center gap-1.5 sm:gap-2"
          onClick={() => navigate("/profile")}
        >
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name || "Profile"}
              className="h-9 w-9 rounded-full object-cover sm:h-[42px] sm:w-[42px]"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5b5fef] text-xs font-semibold text-white sm:h-[42px] sm:w-[42px] sm:text-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          <ChevronDown size={16} className="hidden text-[#555b79] sm:block" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
