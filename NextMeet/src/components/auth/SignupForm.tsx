import { useState } from "react";
import { Link } from "react-router-dom";
import { signup } from "../../lib/auth-api";

const SignupForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (password.length < 6) {
      setError("Your password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await signup(name.trim(), email.trim(), password);
      setMessage(`${response.message} You can now log in.`);
      setPassword("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We could not create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "h-[50px] w-full rounded-full border border-gray-200 px-5 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-800 focus:border-[#5146e5] focus:ring-1 focus:ring-[#5146e5]";

  return (
    <form onSubmit={handleSubmit} className="mt-[34px] space-y-[17px]">
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-[14px] font-medium text-gray-700"
        >
          Name
        </label>
        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClassName}
          placeholder="Your name"
          autoComplete="name"
          required
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-[14px] font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClassName}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-[14px] font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClassName}
          placeholder="Create a password"
          autoComplete="new-password"
          required
          minLength={6}
        />
      </div>
      <p className="text-center text-[14px] text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="text-[#4f46e5] hover:underline">
          Log in
        </Link>
      </p>
      {error && (
        <p role="alert" className="text-center text-sm text-red-600">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-center text-sm text-green-600">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-[44px] w-full rounded-full bg-[#5146e5] text-[14px] font-medium text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
};

export default SignupForm;
