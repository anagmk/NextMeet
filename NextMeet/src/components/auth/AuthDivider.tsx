interface AuthDividerProps {
  text?: string;
}

const AuthDivider = ({
  text = "or continue with",
}: AuthDividerProps) => {
  return (
    <div className="my-[27px] flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />

      <span className="text-[12px] text-gray-400">
        {text}
      </span>

      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
};

export default AuthDivider;