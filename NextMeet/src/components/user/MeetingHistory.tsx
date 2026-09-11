import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, Clock3, FileText, UserRound, Users } from "lucide-react";

type HistoryEntry = {
  _id: string;
  meetingCode: string;
  title: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
  scheduledAt: string;
  closedAt?: string;
  duration?: number;
  host?: { _id?: string; name?: string; email?: string } | null;
  isHost: boolean;
  participantCount: number;
  overallResult?: "passed" | "failed" | null;
  overallScore?: number;
  totalQuestions?: number;
};

const formatDate = (value?: string) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function MeetingHistory() {
  const [meetings, setMeetings] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const apiUrl = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");
        const res = await fetch(`${apiUrl}/user/meetings/history?page=${page}&limit=6`, { credentials: "include" });
        const payload = await res.json().catch(() => ({ meetings: [] }));

        if (!res.ok) {
          throw new Error(payload.message || "Could not load meeting history.");
        }

        const baseMeetings = Array.isArray(payload?.meetings) ? payload.meetings : [];
        const entries = baseMeetings.map((meeting: any) => ({
          _id: meeting?._id ?? meeting?.meetingCode ?? "",
          meetingCode: meeting?.meetingCode ?? "",
          title: meeting?.title || "Untitled meeting",
          status: meeting?.status || "scheduled",
          scheduledAt: meeting?.scheduledAt || new Date().toISOString(),
          closedAt: meeting?.closedAt,
          duration: meeting?.duration,
          host: meeting?.host && typeof meeting.host === "object" ? meeting.host : null,
          isHost: Boolean(meeting?.isHost),
          participantCount: Number(meeting?.participantCount ?? 0),
        }));

        const reportEntries = await Promise.all(
          entries
            .filter((meeting: HistoryEntry) => meeting.status === "completed" && meeting.meetingCode)
            .map(async (meeting: HistoryEntry) => {
              try {
                const reportRes = await fetch(`${apiUrl}/user/meetings/${encodeURIComponent(meeting.meetingCode)}/report`, {
                  credentials: "include",
                });
                if (!reportRes.ok) return { ...meeting, overallResult: null, overallScore: 0, totalQuestions: 0 };
                const reportData = await reportRes.json().catch(() => null);
                const report = reportData?.report ?? null;
                return {
                  ...meeting,
                  overallResult: report?.overallResult ?? null,
                  overallScore: report?.overallScore ?? 0,
                  totalQuestions: report?.totalQuestions ?? report?.questionEvaluations?.length ?? 0,
                };
              } catch {
                return { ...meeting, overallResult: null, overallScore: 0, totalQuestions: 0 };
              }
            }),
        );

        const reportMap = Object.fromEntries(
          reportEntries.map((meeting) => [meeting.meetingCode, meeting]),
        );

        const nextMeetings = entries.map((meeting: HistoryEntry) => reportMap[meeting.meetingCode] ?? meeting);
        setMeetings(nextMeetings);
        setTotalPages(Math.max(1, Number(payload?.totalPages ?? 1)));
        setTotalRecords(Number(payload?.total ?? nextMeetings.length));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not reach the server.");
        console.error("Fetch meeting history error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [page]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#e8e8ef] bg-white px-5 py-6 text-sm text-[#656982] shadow-sm">
        Loading meeting history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white px-5 py-6 text-sm text-red-600 shadow-sm">
        {error}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#dfe1ea] bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0edff] text-[#5b3fd6]">
          <CalendarDays size={22} />
        </div>
        <p className="text-lg font-semibold text-[#30344f]">No meeting history yet</p>
        <p className="mt-1 text-sm text-[#85899f]">Your completed or recent meetings will appear here.</p>
      </div>
    );
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => {
        const resultLabel = meeting.overallResult === "passed" ? "Passed" : meeting.overallResult === "failed" ? "Failed" : "Completed";
        const resultClasses =
          meeting.overallResult === "passed"
            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
            : meeting.overallResult === "failed"
              ? "bg-red-500/10 text-red-600 border border-red-500/20"
              : "bg-[#f1edff] text-[#5b3fd6] border border-[#e6ddff]";

        return (
          <Link
            key={meeting._id || meeting.meetingCode}
            to={`/meetings/${meeting.meetingCode}/details`}
            className="block rounded-2xl border border-[#e8e8ef] bg-white p-5 shadow-sm transition hover:border-[#cfc5ff] hover:shadow-md"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0edff] text-[#5b3fd6]">
                  <CalendarDays size={20} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-lg font-semibold text-[#171a3a]">{meeting.title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${resultClasses}`}>
                      {resultLabel}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#85899f]">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      {formatDate(meeting.scheduledAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={13} />
                      {meeting.duration ? `${meeting.duration} min` : "Duration not set"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={13} />
                      {meeting.participantCount} participants
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end lg:self-auto">
                <div className="min-w-[110px] rounded-xl border border-[#eeedf4] bg-[#fafafd] px-3 py-2 text-left">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#85899f]">Candidate</p>
                  <p className="mt-1 text-sm font-medium text-[#30344f]">
                    {meeting.isHost ? "You" : meeting.host?.name || "Unknown"}
                  </p>
                </div>

                <div className="min-w-[110px] rounded-xl border border-[#eeedf4] bg-[#fafafd] px-3 py-2 text-left">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#85899f]">Score</p>
                  <p className="mt-1 text-sm font-semibold text-[#30344f]">
                    {meeting.overallScore ? `${meeting.overallScore}%` : meeting.totalQuestions ? "0%" : "—"}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-lg border border-[#dedee8] bg-white px-3 py-2 text-sm font-medium text-[#30344f]">
                  <FileText size={15} className="text-[#5b3fd6]" />
                  View
                  <ChevronRight size={15} className="text-[#85899f]" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0f1f6] pt-4 text-xs text-[#85899f]">
              <span className="inline-flex items-center gap-1.5">
                <UserRound size={12} />
                {meeting.isHost ? "Hosted by you" : `Hosted by ${meeting.host?.name || "the host"}`}
              </span>
              <span>
                {meeting.totalQuestions ? `${meeting.totalQuestions} questions` : "Interview record"}
              </span>
            </div>
          </Link>
        );
      })}

      {totalPages > 1 && (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#e8e8ef] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#85899f]">
            Page {page} of {totalPages} · {totalRecords} total records
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-[#e2e2ea] px-3 py-1.5 text-sm text-[#555a73] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                  pageNumber === page
                    ? "bg-[#f0edff] text-[#5b3fd6]"
                    : "text-[#555a73] hover:bg-[#f5f4f9]"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-lg border border-[#e2e2ea] px-3 py-1.5 text-sm text-[#555a73] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}