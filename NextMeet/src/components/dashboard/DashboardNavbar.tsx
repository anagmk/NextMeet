
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type NotificationItem = {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  meetingCode?: string;
};

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/notifications`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({ notifications: [] }));
      if (!res.ok) return;
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = window.setInterval(fetchNotifications, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const onOpenNotification = async (notification: NotificationItem) => {
    setOpen(false);

    if (notification.meetingCode) {
      navigate(`/meetings/${notification.meetingCode}/report`);
    }

    if (!notification.isRead) {
      await fetch(`${import.meta.env.VITE_API_URL}/api/user/notifications/${notification._id}/read`, {
        method: "PATCH",
        credentials: "include",
      }).catch(() => undefined);
      await fetchNotifications();
    }
  };

  return (
    <header className="h-14 border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5146e5] text-xs font-bold text-white">
            NM
          </div>

          <span className="text-[15px] font-semibold text-gray-900">
            NexMeet
          </span>
        </div>

        <nav className="hidden items-center gap-7 text-[12px] md:flex" />

        <div className="relative flex items-center gap-4">
          <button
            type="button"
            onClick={() => setOpen((previous) => !previous)}
            className="relative text-gray-600"
          >
            <span aria-hidden="true">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5146e5] px-1 text-[9px] text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </button>

          {open && (
            <div className="absolute right-0 top-12 z-20 w-[300px] rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
              {notifications.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-gray-500">No notifications yet.</div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() => onOpenNotification(notification)}
                    className={`mb-2 block w-full rounded-lg border px-3 py-2 text-left ${
                      notification.isRead ? "border-gray-200 bg-gray-50" : "border-[#e5e0ff] bg-[#f5f2ff]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-gray-800">{notification.message}</p>
                      {!notification.isRead && <span className="mt-1 h-2 w-2 rounded-full bg-[#5146e5]" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          <div className="flex items-center gap-1">
            <img
              src="https://i.pravatar.cc/100?img=12"
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover"
              onClick={() => navigate("/profile")}
            />

            <span aria-hidden="true" className="text-gray-500">⌄</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
