import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  Link,
  Video,
} from "lucide-react";

function ScheduleMeeting() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [meetingLink, setMeetingLink] = useState(""); // shown after "Generate Invite Link"

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Shared function — used by both buttons, just differs in what happens after success
  const createMeeting = async () => {
    setError("");

    if (!formData.title.trim()) {
      setError("Meeting title is required");
      return null;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/meetings/create", {
        method: "POST",
        credentials: "include", // sends httpOnly JWT cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          scheduledAt:
            formData.date && formData.time
              ? `${formData.date}T${formData.time}`
              : new Date().toISOString(),
          duration: 60,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create meeting");
      }

      return await res.json(); // the saved meeting doc, includes meetingCode
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // "Create Meeting" button — creates it and takes the host straight into the call
  const handleSubmit = async (e) => {
    e.preventDefault();
    const meeting = await createMeeting();
    if (meeting) {
      navigate(`/join/${meeting.meetingCode}`);
    }
  };

  // "Generate Invite Link" button — creates it but stays on this screen, shows link to copy
  const handleGenerateLink = async () => {
    const meeting = await createMeeting();
    if (meeting) {
      setMeetingLink(`${window.location.origin}/join/${meeting.meetingCode}`);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(meetingLink);
  };

  return (
    <div className="min-h-screen bg-[#f8f8fc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-7 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#5b3fd6] transition hover:bg-[#f0edff]"
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </button>

        <div className="mb-7">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eeeaff] text-[#5b3fd6]">
            <Video size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171a3a] sm:text-4xl">
            Schedule a meeting
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#656982] sm:text-base">
            Set the details below and share the invite link with your team.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e8e8ef] bg-white shadow-[0_4px_20px_rgba(35,31,65,0.04)]">
          <div className="border-b border-[#eeeeF3] px-6 py-5 sm:px-8">
            <h2 className="text-lg font-semibold text-[#191c40]">Meeting details</h2>
            <p className="mt-1 text-sm text-[#777b93]">
              Enter the information for your upcoming meeting.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {meetingLink && (
              <div className="rounded-lg border border-[#e8e4ff] bg-[#f8f6ff] px-4 py-3.5">
                <p className="mb-2 text-sm font-medium text-[#3b326e]">
                  Meeting created — share this link:
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={meetingLink}
                    onClick={(e) => e.target.select()}
                    className="h-10 flex-1 rounded-lg border border-[#dedee8] bg-white px-3 text-sm text-[#30344f]"
                  />
                  <button
                    type="button"
                    onClick={copyLink}
                    className="h-10 rounded-lg bg-[#5b3fd6] px-4 text-sm font-medium text-white hover:bg-[#4d32c5]"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Meeting Title */}
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-[#343850]">
                Meeting title
              </label>
              <div className="relative">
                <FileText size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9296aa]" />
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Product Sync — Design Team"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="h-12 w-full rounded-lg border border-[#dedee8] bg-white pl-11 pr-4 text-sm text-[#30344f] outline-none transition placeholder:text-[#a0a3b4] focus:border-[#765ee0] focus:ring-4 focus:ring-[#eeeaff]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="description" className="block text-sm font-medium text-[#343850]">
                  Description
                </label>
                <span className="text-xs text-[#999caf]">Optional</span>
              </div>
              <textarea
                id="description"
                name="description"
                placeholder="Add some information about this meeting..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full resize-none rounded-lg border border-[#dedee8] bg-white px-4 py-3 text-sm text-[#30344f] outline-none transition placeholder:text-[#a0a3b4] focus:border-[#765ee0] focus:ring-4 focus:ring-[#eeeaff]"
              />
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className="mb-2 block text-sm font-medium text-[#343850]">
                  Date
                </label>
                <div className="relative">
                  <CalendarDays size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9296aa]" />
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="h-12 w-full rounded-lg border border-[#dedee8] bg-white pl-11 pr-4 text-sm text-[#30344f] outline-none transition focus:border-[#765ee0] focus:ring-4 focus:ring-[#eeeaff]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="time" className="mb-2 block text-sm font-medium text-[#343850]">
                  Time
                </label>
                <div className="relative">
                  <Clock3 size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9296aa]" />
                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="h-12 w-full rounded-lg border border-[#dedee8] bg-white pl-11 pr-4 text-sm text-[#30344f] outline-none transition focus:border-[#765ee0] focus:ring-4 focus:ring-[#eeeaff]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-[#e8e4ff] bg-[#f8f6ff] px-4 py-3.5">
              <Clock3 size={18} className="mt-0.5 shrink-0 text-[#5b3fd6]" />
              <div>
                <p className="text-sm font-medium text-[#3b326e]">Meeting duration</p>
                <p className="mt-0.5 text-xs text-[#77719a]">
                  The default meeting duration is 60 minutes.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#eeeeF3] pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleGenerateLink}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#dedee8] bg-white px-5 text-sm font-medium text-[#444861] transition hover:border-[#cfc5ff] hover:bg-[#faf9ff] hover:text-[#5b3fd6] disabled:opacity-50"
              >
                <Link size={17} />
                {loading ? "Generating..." : "Generate Invite Link"}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#5b3fd6] px-6 text-sm font-medium text-white shadow-sm transition hover:bg-[#4d32c5] focus:outline-none focus:ring-4 focus:ring-[#ddd5ff] disabled:opacity-50"
              >
                <Video size={17} />
                {loading ? "Creating..." : "Create Meeting"}
              </button>
            </div>

          </form>
        </div>

        <p className="mt-5 text-center text-xs text-[#9296aa]">
          You can edit the meeting details after creating it.
        </p>

      </div>
    </div>
  );
}

export default ScheduleMeeting;