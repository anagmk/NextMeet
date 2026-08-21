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
      // The input can be a raw meeting code rather than a URL.
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
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#f8f8fc] px-4 py-10">
      <div className="w-full max-w-[520px]">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-7 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#5b3fd6] transition hover:bg-[#eeeaff]"
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </button>

        {/* Card */}
        <div className="rounded-2xl border border-[#e8e8ef] bg-white p-6 shadow-[0_8px_30px_rgba(35,31,65,0.06)] sm:p-8">

          {/* Icon */}
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eeeaff] text-[#5b3fd6]">
            <Video size={24} />
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-[#171a3a] sm:text-3xl">
              Join a meeting
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#656982]">
              Enter the meeting link or code shared with you to join the
              meeting.
            </p>
          </div>

          <form onSubmit={handleJoinMeeting}>

            {/* Input */}
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
                <Link2
                  size={19}
                  className="shrink-0 text-[#9296aa]"
                />

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
                  placeholder="Paste meeting link or enter code"
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#30344f] outline-none placeholder:text-[#a0a3b4]"
                />
              </div>

              {error && (
                <p className="mt-2 text-xs text-red-500">
                  {error}
                </p>
              )}
            </div>

            {/* Join */}
            <button
              type="submit"
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#5b3fd6] text-sm font-medium text-white shadow-sm transition hover:bg-[#4d32c5] focus:outline-none focus:ring-4 focus:ring-[#ddd5ff]"
            >
              <Video size={18} />
              Join Meeting
            </button>

          </form>

          {/* Hint */}
          <div className="mt-6 rounded-lg border border-[#eeeef4] bg-[#fafafd] px-4 py-3">
            <p className="text-xs leading-5 text-[#777b93]">
              You can enter either the complete meeting URL or the meeting
              code provided by the host.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default JoinMeeting;