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
        className="flex h-[46px] w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white text-[14px] font-medium text-gray-700 shadow-sm transition hover:border-[#c7c3f7] hover:bg-[#fafaff] hover:text-[#3730a3] focus:outline-none focus:ring-2 focus:ring-[#5146e5]/20"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
          <path fill="#4285F4" d="M21.6 12.23c0-.78-.07-1.53-.2-2.25H12v4.26h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.89-1.74 2.99-4.3 2.99-7.54Z" />
          <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.22-2.51c-.9.6-2.05.95-3.39.95-2.61 0-4.82-1.76-5.61-4.13H3.06v2.59A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.39 13.88A6 6 0 0 1 6.08 12c0-.65.11-1.28.31-1.88V7.53H3.06A10 10 0 0 0 2 12c0 1.61.39 3.13 1.06 4.47l3.33-2.59Z" />
          <path fill="#EA4335" d="M12 5.99c1.47 0 2.79.51 3.83 1.51l2.87-2.87C16.95 3.01 14.7 2 12 2a10 10 0 0 0-8.94 5.53l3.33 2.59C7.18 7.75 9.39 5.99 12 5.99Z" />
        </svg>
        <span>Continue with Google</span>
      </button>
    </div>
  );
};

export default SocialLogin;
