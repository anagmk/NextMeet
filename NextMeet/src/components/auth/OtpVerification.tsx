import { useEffect, useState } from "react";

type OtpVerificationProps = {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  initialSeconds?: number;
};

const OtpVerification = ({ email, onVerify, onResend, initialSeconds = 900 }: OtpVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    if (secondsLeft === 0) {
      setError("This code has expired. Request a new one.");
      return;
    }
    setIsVerifying(true);
    try {
      await onVerify(otp);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We could not verify that code.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setIsResending(true);
    try {
      await onResend();
      setOtp("");
      setSecondsLeft(initialSeconds);
      setMessage("A new code has been sent to your email.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We could not send a new code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="mt-[34px] space-y-[17px]">
      <p className="text-center text-sm text-gray-500">We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>.</p>
      <div>
        <label htmlFor="otp" className="mb-2 block text-[14px] font-medium text-gray-700">Verification code</label>
        <input id="otp" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" className="h-[50px] w-full rounded-full border border-gray-200 px-5 text-center text-lg tracking-[0.35em] text-gray-900 outline-none transition placeholder:tracking-normal focus:border-[#5146e5] focus:ring-1 focus:ring-[#5146e5]" />
      </div>
      <p className={`text-center text-sm ${secondsLeft > 0 ? "text-gray-500" : "text-red-600"}`}>{secondsLeft > 0 ? `Code expires in ${formatTime}` : "Code expired"}</p>
      {error && <p role="alert" className="text-center text-sm text-red-600">{error}</p>}
      {message && <p role="status" className="text-center text-sm text-green-600">{message}</p>}
      <button type="submit" disabled={isVerifying || secondsLeft === 0} className="h-[44px] w-full rounded-full bg-[#5146e5] text-[14px] font-medium text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-70">{isVerifying ? "Verifying..." : "Verify code"}</button>
      <button type="button" onClick={handleResend} disabled={secondsLeft > 0 || isResending} className="w-full text-sm font-medium text-[#4f46e5] hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline">{isResending ? "Sending code..." : secondsLeft > 0 ? `Resend available in ${formatTime}` : "Resend code"}</button>
    </form>
  );
};

export default OtpVerification;
