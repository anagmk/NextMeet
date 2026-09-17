import AuthNavbar from "../../components/auth/AuthNavbar";
import AuthHeader from "../../components/auth/AuthHeader";
import LoginForm from "../../components/auth/LoginForm";
import AuthDivider from "../../components/auth/AuthDivider";
import SocialLogin from "../../components/auth/SocialLogin";

const Login = () => {
  return (
    <div className="auth-page min-h-screen bg-white text-[#111827]">
      <AuthNavbar />

      <main className="flex justify-center px-5">
        <div className="mt-8 w-full max-w-[420px] rounded-2xl border border-gray-200 px-6 py-7 shadow-sm sm:px-8">
          <AuthHeader
            title="Welcome back"
            subtitle="Log in to jump back into your meetings."
          />

          <LoginForm />

          <AuthDivider />

          <SocialLogin />
        </div>
      </main>
    </div>
  );
};

export default Login;