import { Link } from "react-router-dom";

const AuthNavbar = () => {
  return (
    <nav className="flex h-[62px] items-center justify-between border-b border-gray-100 px-10">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5146e5] text-sm font-semibold text-white">
          NM
        </div>

        <span className="text-[17px] font-semibold text-gray-900">
          NexMeet
        </span>
      </Link>

      {/* Navigation */}
      <div className="flex items-center gap-7 text-sm">
        <Link
          to="/"
          className="text-gray-600 transition hover:text-gray-900"
        >
          Home
        </Link>

        <Link
          to="/join-meeting"
          className="text-[#4f46e5] transition hover:text-[#3730a3]"
        >
          Join meeting
        </Link>

        <Link
          to="/login"
          className="rounded-md bg-[#5146e5] px-2 py-[2px] text-sm text-white"
        >
          Login
        </Link>
      </div>
    </nav>
  );
};

export default AuthNavbar;