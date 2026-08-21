
import { useNavigate } from "react-router-dom";

const WelcomeBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[180px] overflow-hidden rounded-2xl bg-[#5146e5] px-7 py-7 text-white">
      <div>
        <h1 className="text-2xl font-bold md:text-[25px]">
          Good morning, Anag 👋
        </h1>

        <p className="mt-1 max-w-[330px] text-[12px] leading-4 text-white/80">
          You have 2 meetings scheduled for today. Let's make it a productive
          one.
        </p>

        <div className="mt-6 flex items-center gap-8">
          <button
            type="button"
            onClick={() => navigate("/create-meeting")}
            className="rounded-full bg-white px-6 py-2.5 text-[12px] font-medium text-[#5146e5]"
          >
            Create Meeting
          </button>

          <button className="text-[12px] font-medium text-white" type="button"
           onClick={() => navigate("/join-meeting")}>
            Join Meeting
          </button>
        </div>
      </div>

      {/* Participants */}
      <div className="absolute right-7 top-1/2 flex -translate-y-1/2 items-center">
        <div className="flex -space-x-3">
          <img
            src="https://i.pravatar.cc/100?img=32"
            className="h-10 w-10 rounded-full border-2 border-white object-cover"
            alt=""
          />

          <img
            src="https://i.pravatar.cc/100?img=44"
            className="h-10 w-10 rounded-full border-2 border-white object-cover"
            alt=""
          />

          <img
            src="https://i.pravatar.cc/100?img=47"
            className="h-10 w-10 rounded-full border-2 border-white object-cover"
            alt=""
          />

          <img
            src="https://i.pravatar.cc/100?img=49"
            className="h-10 w-10 rounded-full border-2 border-white object-cover"
            alt=""
          />
        </div>

        <div className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xs">
          +6
        </div>
      </div>
    </section>
  );
};

export default WelcomeBanner;