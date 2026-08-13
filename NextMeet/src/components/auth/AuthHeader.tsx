interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <div className="text-center">
      <h1 className="text-[30px] font-bold tracking-[-0.5px] text-[#111827]">
        {title}
      </h1>

      <p className="mt-1 text-[14px] text-gray-500">
        {subtitle}
      </p>
    </div>
  );
};

export default AuthHeader;