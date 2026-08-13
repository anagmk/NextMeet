
const DashboardNavbar = () => {
  return (
    <header className="h-14 border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-full items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5146e5] text-xs font-bold text-white">
            NM
          </div>

          <span className="text-[15px] font-semibold text-gray-900">
            NexMeet
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden items-center gap-7 text-[12px] md:flex">
          <a className="font-medium text-[#5146e5]" href="#">
            Dashboard
          </a>

          <a className="text-gray-600 hover:text-gray-900" href="#">
            Join
          </a>

          <a className="text-gray-600 hover:text-gray-900" href="#">
            Host
          </a>

          <a className="text-gray-600 hover:text-gray-900" href="#">
            Schedule
          </a>

          <a className="text-gray-600 hover:text-gray-900" href="#">
            About
          </a>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button className="text-gray-600">
            <span aria-hidden="true">🔔</span>
            <span className="sr-only">Notifications</span>
          </button>

          <div className="flex items-center gap-1">
            <img
              src="https://i.pravatar.cc/100?img=12"
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover"
            />

            <span aria-hidden="true" className="text-gray-500">⌄</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
