import AuthHeader from "../../components/auth/AuthHeader";
import AuthNavbar from "../../components/auth/AuthNavbar";
import SignupForm from "../../components/auth/SignupForm";

const Signup = () => (
  <div className="min-h-screen bg-white text-[#111827]">
    <AuthNavbar />
    <main className="flex justify-center px-5">
      <div className="w-full max-w-[384px] pt-[14px]">
        <AuthHeader title="Create your account" subtitle="Start scheduling better meetings." />
        <SignupForm />
      </div>
    </main>
  </div>
);

export default Signup;
