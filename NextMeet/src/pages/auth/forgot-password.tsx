import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthHeader from "../../components/auth/AuthHeader";
import AuthNavbar from "../../components/auth/AuthNavbar";
import OtpVerification from "../../components/auth/OtpVerification";
import { forgotPassword, resendResetOtp, verifyResetOtp } from "../../lib/auth-api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();

  const submitEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!email.trim()) return setError("Please enter your email address.");
    setIsSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setCodeSent(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We could not send a verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="min-h-screen bg-white text-[#111827]"><AuthNavbar /><main className="flex justify-center px-5"><div className="w-full max-w-[384px] pt-[14px]"><AuthHeader title={codeSent ? "Verify your email" : "Forgot your password?"} subtitle={codeSent ? "Enter the code to continue." : "We'll send a verification code to your email."} />{codeSent ? <OtpVerification email={email.trim()} onResend={async () => { await resendResetOtp(email.trim()); }} onVerify={async (otp) => { const response = await verifyResetOtp(email.trim(), otp); if (!response.resetToken) throw new Error("We could not start your password reset. Please try again."); navigate("/reset-password", { state: { email: email.trim(), resetToken: response.resetToken } }); }} /> : <form onSubmit={submitEmail} className="mt-[34px] space-y-[17px]"><div><label htmlFor="email" className="mb-2 block text-[14px] font-medium text-gray-700">Email</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" className="h-[50px] w-full rounded-full border border-gray-200 px-5 text-[14px] text-gray-900 outline-none focus:border-[#5146e5] focus:ring-1 focus:ring-[#5146e5]" /></div>{error && <p role="alert" className="text-center text-sm text-red-600">{error}</p>}<button type="submit" disabled={isSubmitting} className="h-[44px] w-full rounded-full bg-[#5146e5] text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? "Sending code..." : "Send verification code"}</button><p className="text-center text-sm text-gray-500"><Link to="/login" className="text-[#4f46e5] hover:underline">Back to login</Link></p></form>}</div></main></div>;
};

export default ForgotPassword;
