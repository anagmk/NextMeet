import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { login as loginRequest } from "../../lib/auth-api";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuthenticatedUser } = useUser();
  const successMessage = (location.state as { message?: string } | null)
    ?.message;
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("LOGIN START");

      const response = await loginRequest(email.trim(), password);
      await setAuthenticatedUser(response.user ?? null);

      console.log("LOGIN SUCCESS");

      navigate("/dashboard", { replace: true });

      console.log("NAVIGATE CALLED");
    } catch (requestError) {
      console.log("LOGIN ERROR:", requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "We could not log you in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-[34px]">
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-[14px] font-medium text-gray-700"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="h-[50px] w-full rounded-full border border-gray-200 px-5 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-800 focus:border-[#5146e5] focus:ring-1 focus:ring-[#5146e5]"
        />
      </div>

      {/* Password */}
      <div className="mt-[17px]">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-[14px] font-medium text-gray-700"
          >
            Password
          </label>

          <Link
            to="/forgot-password"
            className="text-[13px] text-[#4f46e5] hover:text-[#3730a3]"
          >
            Forgot Password?
          </Link>
        </div>

        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          className="h-[50px] w-full rounded-full border border-gray-200 px-5 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-800 focus:border-[#5146e5] focus:ring-1 focus:ring-[#5146e5]"
        />
      </div>

      {/* Register */}
      <div className="mt-[20px] text-center">
        <span className="text-[14px] text-gray-500">
          Don't have an account?
        </span>

        <Link
          to="/register"
          className="ml-1 text-[14px] text-[#4f46e5] hover:underline"
        >
          Sign up
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-center text-sm text-red-600">
          {error}
        </p>
      )}
      {successMessage && (
        <p role="status" className="mt-3 text-center text-sm text-green-600">
          {successMessage}
        </p>
      )}

      {/* Login Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-[17px] h-[44px] w-full rounded-full bg-[#5146e5] text-[14px] font-medium text-white transition hover:bg-[#4338ca] active:scale-[0.99]"
      >
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
};

export default LoginForm;
