import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthHeader from "../../components/auth/AuthHeader";
import AuthNavbar from "../../components/auth/AuthNavbar";
import { resetPassword } from "../../lib/auth-api";

type ResetState = { email?: string; resetToken?: string };

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, resetToken } = (location.state ?? {}) as ResetState;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!email || !resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError("");
    if (!password || !confirmPassword) return setError("Please enter and confirm your new password.");
    if (password.length < 6) return setError("Your password must be at least 6 characters long.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setIsSubmitting(true);
    try { await resetPassword(email, resetToken, password); navigate("/login", { replace: true, state: { message: "Password reset successfully. Please log in." } }); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "We could not reset your password."); }
    finally { setIsSubmitting(false); }
  };

  const inputClass = "h-[50px] w-full rounded-full border border-gray-200 px-5 text-[14px] text-gray-900 outline-none focus:border-[#5146e5] focus:ring-1 focus:ring-[#5146e5]";
  return <div className="min-h-screen bg-white text-[#111827]"><AuthNavbar /><main className="flex justify-center px-5"><div className="w-full max-w-[384px] pt-[14px]"><AuthHeader title="Reset your password" subtitle="Choose a new password for your account." /><form onSubmit={submit} className="mt-[34px] space-y-[17px]"><div><label htmlFor="new-password" className="mb-2 block text-[14px] font-medium text-gray-700">New password</label><input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" className={inputClass} /></div><div><label htmlFor="confirm-password" className="mb-2 block text-[14px] font-medium text-gray-700">Confirm password</label><input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" className={inputClass} /></div>{error && <p role="alert" className="text-center text-sm text-red-600">{error}</p>}<button type="submit" disabled={isSubmitting} className="h-[44px] w-full rounded-full bg-[#5146e5] text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? "Resetting password..." : "Reset password"}</button></form></div></main></div>;
};

export default ResetPassword;
