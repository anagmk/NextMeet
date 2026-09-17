import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  getThemePreference,
  onThemePreferenceChange,
  setThemePreference,
  type AppTheme,
} from "../../lib/theme";

const AuthNavbar = () => {
  const location = useLocation();
  const [theme, setTheme] = useState<AppTheme>(getThemePreference);

  useEffect(() => onThemePreferenceChange(setTheme), []);

  const cycleTheme = () => {
    const nextTheme: AppTheme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setThemePreference(nextTheme);
    setTheme(nextTheme);
  };

  const isLoginPage = location.pathname === "/login";

  return (
    <nav className="flex h-[62px] items-center justify-between border-b border-gray-100 px-5 sm:px-10">
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
      <div className="flex items-center gap-3 text-sm sm:gap-7">
        <button
          type="button"
          onClick={cycleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-[#b8b4e8] hover:text-[#4f46e5]"
          title={`Theme: ${theme}. Click to switch.`}
          aria-label={`Theme: ${theme}. Click to switch.`}
        >
          {theme === "light" ? <Sun size={17} /> : theme === "dark" ? <Moon size={17} /> : <Monitor size={17} />}
        </button>

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
          to={isLoginPage ? "/register" : "/login"}
          className="rounded-md bg-[#5146e5] px-2 py-[2px] text-sm text-white"
        >
          {isLoginPage ? "Sign up" : "Login"}
        </Link>
      </div>
    </nav>
  );
};

export default AuthNavbar;