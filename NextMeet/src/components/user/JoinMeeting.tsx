import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Link2, Video } from "lucide-react";

const JoinMeeting = () => {
  const navigate = useNavigate();

  const [meetingInput, setMeetingInput] = useState("");
  const [error, setError] = useState("");

  const handleJoinMeeting = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = meetingInput.trim();

    if (!value) {
      setError("Please enter a meeting link or code.");
      return;
    }

    let meetingCode = value;

    try {
      const parsedUrl = new URL(value);
      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
      const joinIndex = pathParts.indexOf("join");

      if (joinIndex !== -1 && pathParts[joinIndex + 1]) {
        meetingCode = pathParts[joinIndex + 1];
      }
    } catch {
      // Raw meeting code
    }

    meetingCode = meetingCode.trim().toUpperCase();

    if (!/^[A-Z0-9]+$/.test(meetingCode)) {
      setError("Enter a valid meeting link or code.");
      return;
    }

    setError("");
    navigate(`/join/${encodeURIComponent(meetingCode)}`);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f8f8fc] px-4 py-6">
      <div className="mx-auto flex w-full max-w-[1200px] items-start justify-center gap-8">
        {/* ==================== MAIN CONTENT ==================== */}
        <main className="flex min-w-0 flex-1 justify-center">
          <div className="w-full max-w-[520px]">
            {/* Back */}
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-[#5b3fd6] transition hover:bg-[#eeeaff]"
            >
              <ArrowLeft size={17} />
              Back to dashboard
            </button>

            {/* Join Meeting Card */}
            <div className="rounded-2xl border border-[#e8e8ef] bg-white p-5 shadow-[0_8px_30px_rgba(35,31,65,0.06)] sm:p-6">
              {/* Header */}
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eeeaff] text-[#5b3fd6]">
                  <Video size={22} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#171a3a]">
                    Join a meeting
                  </h1>

                  <p className="mt-1 text-sm leading-5 text-[#656982]">
                    Enter the meeting link or code shared with you.
                  </p>
                </div>
              </div>

              <form onSubmit={handleJoinMeeting}>
                {/* Meeting Input */}
                <div>
                  <label
                    htmlFor="meetingInput"
                    className="mb-2 block text-sm font-medium text-[#343850]"
                  >
                    Meeting link or code
                  </label>

                  <div
                    className={`flex h-12 items-center gap-3 rounded-lg border bg-white px-3.5 transition ${
                      error
                        ? "border-red-400 ring-4 ring-red-50"
                        : "border-[#dedee8] focus-within:border-[#765ee0] focus-within:ring-4 focus-within:ring-[#eeeaff]"
                    }`}
                  >
                    <Link2 size={18} className="shrink-0 text-[#9296aa]" />

                    <input
                      id="meetingInput"
                      name="meetingInput"
                      type="text"
                      value={meetingInput}
                      onChange={(e) => {
                        setMeetingInput(e.target.value);

                        if (error) {
                          setError("");
                        }
                      }}
                      placeholder="Paste link or enter code"
                      autoComplete="off"
                      className="min-w-0 flex-1 bg-transparent text-sm text-[#30344f] outline-none placeholder:text-[#a0a3b4]"
                    />
                  </div>

                  {error && (
                    <p className="mt-2 text-xs text-red-500">{error}</p>
                  )}
                </div>

                {/* Join Button */}
                <button
                  type="submit"
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#5b3fd6] text-sm font-medium text-white shadow-sm transition hover:bg-[#4d32c5] focus:outline-none focus:ring-4 focus:ring-[#ddd5ff]"
                >
                  <Video size={18} />
                  Join Meeting
                </button>
              </form>

              {/* Hint */}
              <p className="mt-4 text-xs leading-5 text-[#777b93]">
                You can enter the complete meeting URL or the meeting code
                provided by the host.
              </p>
            </div>
          </div>
        </main>

        {/* ==================== RIGHT AD SPACE ==================== */}
        <aside className="hidden w-[300px] shrink-0 xl:block">
          <div className="sticky top-6 flex flex-col gap-5">
            {/* ==================== STATIC AD 1 ==================== */}
            <div className="relative h-[250px] w-[300px] overflow-hidden rounded-md border border-[#e5e5eb] bg-white">
              {/* Advertisement Label */}
              <div className="absolute left-2 top-1 z-10 text-[9px] text-[#a0a3b4]">
                Advertisement
              </div>

              {/* Ad Content */}
              <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#f0edff] via-white to-[#f7f5ff] px-6 text-center">
                {/* Logo/Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#5b3fd6] shadow-sm">
                  <Video size={28} className="text-white" />
                </div>

                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#7b6bd6]">
                  NextMeet
                </p>

                <h3 className="mt-1 text-lg font-bold text-[#171a3a]">
                  Meet. Connect. Collaborate.
                </h3>

                <p className="mt-1 text-[11px] leading-4 text-[#777b93]">
                  Simple and reliable online meetings.
                </p>

                <button
                  type="button"
                  className="mt-4 rounded-md bg-[#5b3fd6] px-5 py-2 text-[11px] font-semibold text-white transition hover:bg-[#4d32c5]"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* ==================== STATIC AD 2 ==================== */}
            <div className="relative h-[250px] w-[300px] overflow-hidden rounded-md border border-[#e5e5eb] bg-white">
              {/* Advertisement Label */}
              <div className="absolute left-2 top-1 z-10 text-[9px] text-[#a0a3b4]">
                Advertisement
              </div>

              {/* Ad Content */}
              <div className="flex h-full flex-col items-center justify-center bg-white px-6 text-center">
                {/* Fake Brand Banner */}
                <div className="flex h-[90px] w-full items-center justify-center rounded-lg bg-[#171a3a]">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
                      Sponsored
                    </p>

                    <p className="mt-1 text-xl font-bold text-white">
                      CLOUD<span className="text-[#8d7bea]">PRO</span>
                    </p>
                  </div>
                </div>

                <h3 className="mt-4 text-base font-bold text-[#171a3a]">
                  Work smarter online
                </h3>

                <p className="mt-1 text-[11px] leading-4 text-[#777b93]">
                  Powerful tools for modern teams.
                </p>

                <button
                  type="button"
                  className="mt-4 rounded-md border border-[#5b3fd6] px-5 py-2 text-[11px] font-semibold text-[#5b3fd6] transition hover:bg-[#eeeaff]"
                >
                  Explore
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default JoinMeeting;
