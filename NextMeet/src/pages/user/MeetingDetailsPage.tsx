// pages/user/MeetingDetailsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  User,
  Users,
} from "lucide-react";
import Sidebar from "../../components/user/Sidebar";
import Navbar from "../../components/user/Navbar";

type ParticipantEntry = {
  userId: { _id: string; name: string; email: string; profileImage?: string };
  role: "host" | "participant";
  joinedAt?: string;
  leftAt?: string;
};

type MeetingDetails = {
  title: string;
  description?: string;
  meetingCode: string;
  scheduledAt: string;
  duration?: number;
  status: string;
  closedAt?: string;
  host: { _id: string; name: string; email: string; profileImage?: string };
  participants: ParticipantEntry[];
};

export default function MeetingDetailsPage() {
  const { meetingCode } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState<MeetingDetails | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/meetings/${meetingCode}/details`,
          { credentials: "include" },
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Could not load meeting details.");
          return;
        }
        setDetails(data.meeting);
        setIsHost(data.isHost);
      } catch (err) {
        setError("Could not reach the server.");
        console.error("Fetch meeting details error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [meetingCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafd]">
        <Sidebar />
        <div className="md:ml-[250px]">
          <Navbar />
          <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-6 sm:px-6">
            <div className="rounded-2xl border border-[#e8e8ef] bg-white px-6 py-4 text-sm text-[#656982] shadow-sm">
              Loading meeting details...
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-[#fafafd]">
        <Sidebar />
        <div className="md:ml-[250px]">
          <Navbar />
          <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-6 sm:px-6">
            <div className="rounded-2xl border border-red-100 bg-white px-6 py-5 text-sm text-red-600 shadow-sm">
              {error || "Meeting not found."}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(details.scheduledAt).toLocaleString();
  const formattedClosedAt = details.closedAt
    ? new Date(details.closedAt).toLocaleString()
    : null;

  const statusStyles: Record<string, string> = {
    scheduled: "bg-[#eef5ff] text-blue-600",
    active: "bg-[#eafaf0] text-green-600",
    completed: "bg-[#f2f2f5] text-[#656982]",
    cancelled: "bg-[#fff1f2] text-red-600",
  };

  return (
    <div className="min-h-screen bg-[#fafafd]">
      <Sidebar />

      <div className="md:ml-[250px]">
        <Navbar />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#85899f]">
                  Meeting Details
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#171a3a]">
                  {details.title}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/meetings")}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#dedee8] bg-white px-4 py-2.5 text-sm font-medium text-[#30344f] transition hover:border-[#cfc5ff] hover:text-[#5b3fd6]"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => isHost && navigate(`/meetings/${meetingCode}/report`)}
                  disabled={!isHost}
                  title={
                    isHost
                      ? "View the AI-generated interview report"
                      : "Only the host can view the report"
                  }
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    isHost
                      ? "bg-[#5b3fd6] text-white hover:bg-[#4d32c5]"
                      : "cursor-not-allowed border border-[#e8e8ef] bg-[#f5f5f9] text-[#8b8f9d]"
                  }`}
                >
                  <FileText size={16} />
                  Report
                </button>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-[#e8e8ef] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#656982]">
                  {details.description || "No description added for this meeting."}
                </p>

                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-medium capitalize ${
                    statusStyles[details.status.toLowerCase()] ||
                    "bg-[#f1edff] text-[#5b3fd6]"
                  }`}
                >
                  {details.status}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Meeting Code" value={details.meetingCode} icon={<Users size={16} />} />
              <StatCard label="Scheduled" value={formattedDate} icon={<CalendarDays size={16} />} />
              <StatCard
                label="Ended"
                value={formattedClosedAt || "-"}
                icon={<Clock3 size={16} />}
              />
              <StatCard
                label="Duration"
                value={details.duration ? `${details.duration} min` : "-"}
                icon={<Clock3 size={16} />}
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.8fr]">
              <div className="rounded-2xl border border-[#e8e8ef] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-[#191c40]">Host</h2>

                <div className="flex items-center gap-3 rounded-xl border border-[#eeedf4] bg-[#fafafd] p-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0edff] text-[#5b3fd6]">
                    <User size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#30344f]">
                      {details.host.name}
                    </p>
                    <p className="truncate text-xs text-[#85899f]">
                      {details.host.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e8e8ef] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-[#191c40]">Participants</h2>

                <div className="flex flex-col gap-3">
                  {details.participants.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#e3e3ec] bg-[#fafafd] px-4 py-6 text-center text-sm text-[#85899f]">
                      No participants were recorded for this meeting.
                    </div>
                  ) : (
                    details.participants.map((p) => (
                      <div
                        key={p.userId._id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#eeedf4] bg-[#fafafd] px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0edff] text-[#5b3fd6]">
                            <User size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[#30344f]">
                              {p.userId.name}
                            </p>
                            <p className="truncate text-xs text-[#85899f]">
                              {p.userId.email}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-[#f1edff] px-2.5 py-1 text-[11px] font-medium capitalize text-[#5b3fd6]">
                          {p.role}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e8ef] bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0edff] text-[#5b3fd6]">
        {icon}
      </div>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#85899f]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[#30344f]">{value}</p>
    </div>
  );
}
