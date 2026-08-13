import { getGoogleLoginUrl } from "../../lib/auth-api";

const SocialLogin = () => {
  const handleGoogleLogin = () => {
    window.location.assign(getGoogleLoginUrl());
  };

  return (
    <div className="flex items-center justify-around">
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="text-[14px] font-medium text-gray-700 transition hover:text-[#4f46e5]"
      >
        Google
      </button>
    </div>
  );
};

export default SocialLogin;
