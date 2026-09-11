import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  MoreHorizontal,
  Search,
  Users,
  Video,
} from "lucide-react";

type MeetingStatus = "Live" | "Upcoming" | "Scheduled" | "Completed";

type Meeting = {
  id: string;
  title: string;
  meetingId: string;
  host: string;
  hostAvatar: string;
  date: string;
  time: string;
  relativeTime: string;
  participants: string[];
  extraParticipants?: number;
  status: MeetingStatus;
};

type ApiMeeting = {
  _id: string;
  title: string;
  meetingCode: string;
  scheduledAt: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
  hostId?: { name?: string } | string;
  participants?: unknown[];
};

const formatMeeting = (meeting: ApiMeeting): Meeting => {
  const scheduledAt = new Date(meeting.scheduledAt);
  const isCompleted = meeting.status === "completed" || meeting.status === "cancelled";
  const status: MeetingStatus = meeting.status === "active"
    ? "Live"
    : isCompleted
      ? "Completed"
      : "Scheduled";

  return {
    id: meeting._id,
    title: meeting.title,
    meetingId: meeting.meetingCode,
    host: typeof meeting.hostId === "object" ? meeting.hostId.name || "Unknown" : "Unknown",
    hostAvatar: "",
    date: scheduledAt.toLocaleDateString(),
    time: scheduledAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    relativeTime: scheduledAt.toLocaleDateString(),
    participants: [],
    extraParticipants: meeting.participants?.length,
    status,
  };
};

const tabs = [
  "All Meetings",
  "Scheduled",
  "History",

] as const;

type Tab = (typeof tabs)[number];

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("All Meetings");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const apiUrl = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");
        const statusParam =
          activeTab === "Scheduled"
            ? "scheduled"
            : activeTab === "History"
              ? "completed"
              : "all";

        const query = new URLSearchParams({
          page: String(page),
          limit: "8",
          status: statusParam,
          search,
        });

        const response = await fetch(`${apiUrl}/user/meetings?${query.toString()}`, {
          credentials: "include",
        });
        const data = await response.json().catch(() => ({ meetings: [] }));

        if (!response.ok) {
          throw new Error(data.message || "Unable to load meetings");
        }

        const items = Array.isArray(data.meetings) ? data.meetings.map(formatMeeting) : [];
        setMeetings(items);
        setTotalPages(Math.max(1, Number(data.totalPages ?? 1)));
        setTotalRecords(Number(data.total ?? items.length));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load meetings");
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, [activeTab, page, search]);

  const filteredMeetings = useMemo(() => {
    if (!statusFilter || statusFilter === "All") return meetings;
    return meetings.filter((meeting) => meeting.status === statusFilter);
  }, [meetings, statusFilter]);

  return (
    <section className="w-full px-6 py-8 lg:px-10">

      {/* Page Header */}
      <div className="mb-7">
        <h1 className="text-[30px] font-bold tracking-tight text-[#171a3a]">
          Meetings
        </h1>

        <p className="mt-1.5 text-sm text-[#656982]">
          View, manage and join your meetings
        </p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex overflow-x-auto rounded-xl border border-[#e8e8ef] bg-white px-2">
        {tabs.map((tab) => {
          const active = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
              className={`relative whitespace-nowrap px-5 py-4 text-sm font-medium transition ${
                active
                  ? "text-[#5b3fd6]"
                  : "text-[#656982] hover:text-[#30344f]"
              }`}
            >
              {tab}

              {active && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#5b3fd6]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Meeting List */}
      <div className="overflow-hidden rounded-xl border border-[#e8e8ef] bg-white">

        {/* List Header */}
        <div className="flex flex-col gap-4 border-b border-[#eeeeF3] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-[#191c40]">
              {activeTab}
            </h2>

            <p className="mt-1 text-xs text-[#85899f]">
              {filteredMeetings.length} meetings on this page · {totalRecords} total
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">

            {/* Search */}
            <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-[#dedee8] px-3 sm:w-[260px]">
              <Search
                size={17}
                className="shrink-0 text-[#9699aa]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search meetings..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[#30344f] outline-none placeholder:text-[#999caf]"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-[#dedee8] bg-white px-4 pr-9 text-sm text-[#454a64] outline-none focus:border-[#765ee0] sm:w-[130px]"
              >
                <option value="All">All</option>
                <option value="Live">Live</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#85899f]"
              />
            </div>

          </div>
        </div>

        {/* Desktop Table Header */}
        <div className="hidden grid-cols-[2fr_1.2fr_1.4fr_1.2fr_1fr_80px] border-b border-[#eeeeF3] bg-[#fafafd] px-5 py-3 text-xs font-medium text-[#777b93] lg:grid">
          <span>Meeting Info</span>
          <span>Host</span>
          <span>Time</span>
          <span>Participants</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {/* Meetings */}
        <div>
          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center px-5 text-sm text-[#85899f]">
              Loading meetings...
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f1efff] text-[#5b3fd6]">
                <Video size={22} />
              </div>

              <h3 className="text-sm font-semibold text-[#30344f]">
                No meetings found
              </h3>

              <p className="mt-1 text-xs text-[#85899f]">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            filteredMeetings.map((meeting) => (
              <MeetingRow
                key={meeting.id}
                meeting={meeting}
                onDelete={(meetingId) => {
                  setMeetings((prev) => prev.filter((item) => item.id !== meetingId));
                }}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#eeeeF3] px-5 py-4">

          <p className="text-xs text-[#85899f]">
            Showing {filteredMeetings.length} of {totalRecords} · Page {page} of {totalPages}
          </p>

          <div className="flex items-center gap-1">

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e2ea] text-[#9a9dad] disabled:cursor-not-allowed"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs ${
                  pageNumber === page
                    ? "bg-[#f0edff] font-medium text-[#5b3fd6]"
                    : "text-[#555a73] hover:bg-[#f5f4f9]"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e2ea] text-[#555a73] disabled:cursor-not-allowed"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              ›
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

type MeetingRowProps = {
  meeting: Meeting;
  onDelete: (meetingId: string) => void;
};

const MeetingRow = ({ meeting, onDelete }: MeetingRowProps) => {
  const navigate = useNavigate();
  const isLive = meeting.status === "Live";
  const isJoinAction = meeting.status === "Live" || meeting.status === "Scheduled" || meeting.status === "Upcoming";
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleActionClick = () => {
    if (meeting.status === "Completed") {
      navigate(`/meetings/${meeting.meetingId}/details`);
      return;
    }

    navigate(`/join/${meeting.meetingId}`);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const apiUrl = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");
      const response = await fetch(`${apiUrl}/user/meetings/${meeting.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete meeting");
      }

      onDelete(meeting.id);
      setMenuOpen(false);
    } catch (error) {
      console.error("Delete meeting failed:", error);
      alert(error instanceof Error ? error.message : "Unable to delete meeting");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="group border-b border-[#eeeeF3] px-5 py-5 transition last:border-b-0 hover:bg-[#fcfbff]">

      {/* Desktop */}
      <div className="hidden grid-cols-[2fr_1.2fr_1.4fr_1.2fr_1fr_80px] items-center lg:grid">

        {/* Meeting Info */}
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f0edff] text-[#6652d8]">
            <Users size={19} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#252943]">
              {meeting.title}
            </p>

            <p className="mt-1 text-xs text-[#85899f]">
              ID: {meeting.meetingId}
            </p>
          </div>

        </div>

        {/* Host */}
        <div className="flex items-center gap-2.5">

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0edff] text-xs font-semibold text-[#5b3fd6]">
            {meeting.host.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-sm font-medium text-[#30344f]">
              {meeting.host}
            </p>

            <p className="text-[11px] text-[#85899f]">
              {meeting.host === "You" ? "Organizer" : "Host"}
            </p>
          </div>

        </div>

        {/* Time */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#30344f]">
            {isLive ? (
              <span className="h-2 w-2 rounded-full bg-green-500" />
            ) : (
              <CalendarDays
                size={15}
                className="text-[#777b93]"
              />
            )}

            <span className={isLive ? "text-green-600" : ""}>
              {isLive ? "Live now" : `${meeting.date}, ${meeting.time}`}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#85899f]">
            <Clock3 size={12} />
            {meeting.relativeTime}
          </div>
        </div>

        {/* Participants */}
        <ParticipantAvatars meeting={meeting} />

        {/* Status */}
        <StatusBadge status={meeting.status} />

        {/* Action */}
        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={handleActionClick}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
              isLive
                ? "border-[#6d5ce7] text-[#5b3fd6] hover:bg-[#f0edff]"
                : "border-[#dedee8] text-[#555a73] hover:border-[#cfc5ff] hover:text-[#5b3fd6]"
            }`}
          >
            {isJoinAction ? "Join" : "View"}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#85899f] transition hover:bg-[#f0edff] hover:text-[#5b3fd6]"
              aria-label="Meeting actions"
            >
              <MoreHorizontal size={17} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 z-10 w-32 overflow-hidden rounded-lg border border-[#e8e8ef] bg-white shadow-lg">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex w-full items-center justify-start px-3 py-2 text-left text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile / Tablet */}
      <div className="lg:hidden">

        <div className="flex items-start justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f0edff] text-[#6652d8]">
              <Users size={19} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#252943]">
                {meeting.title}
              </p>

              <p className="mt-1 text-xs text-[#85899f]">
                ID: {meeting.meetingId}
              </p>
            </div>

          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#85899f] hover:bg-[#f0edff]"
              aria-label="Meeting actions"
            >
              <MoreHorizontal size={17} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 z-10 w-32 overflow-hidden rounded-lg border border-[#e8e8ef] bg-white shadow-lg">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex w-full items-center justify-start px-3 py-2 text-left text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>

        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wide text-[#999caf]">
              Host
            </p>

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0edff] text-[10px] font-semibold text-[#5b3fd6]">
                {meeting.host.charAt(0).toUpperCase()}
              </div>

              <span className="text-xs font-medium text-[#30344f]">
                {meeting.host}
              </span>
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wide text-[#999caf]">
              Time
            </p>

            <p className="text-xs font-medium text-[#30344f]">
              {meeting.date}, {meeting.time}
            </p>
          </div>

        </div>

        <div className="mt-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <ParticipantAvatars meeting={meeting} />
            <StatusBadge status={meeting.status} />
          </div>

          <button
            type="button"
            onClick={handleActionClick}
            className="rounded-lg border border-[#6d5ce7] px-4 py-2 text-xs font-medium text-[#5b3fd6] hover:bg-[#f0edff]"
          >
            {isJoinAction ? "Join" : "View"}
          </button>

        </div>

      </div>
    </div>
  );
};

const ParticipantAvatars = ({ meeting }: { meeting: Meeting }) => {
  return (
    <div className="flex items-center">

      <div className="flex -space-x-2">
        {meeting.participants.slice(0, 3).map((avatar, index) => (
          <img
            key={index}
            src={avatar}
            alt="Participant"
            className="h-7 w-7 rounded-full border-2 border-white object-cover"
          />
        ))}
      </div>

      {meeting.extraParticipants && (
        <span className="ml-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-[#f0f0f5] px-1.5 text-[10px] font-medium text-[#686d88]">
          +{meeting.extraParticipants}
        </span>
      )}

    </div>
  );
};

const StatusBadge = ({ status }: { status: MeetingStatus }) => {
  const styles: Record<MeetingStatus, string> = {
    Live: "bg-[#eafaf0] text-green-600",
    Upcoming: "bg-[#eef5ff] text-blue-600",
    Scheduled: "bg-[#f1edff] text-[#5b3fd6]",
    Completed: "bg-[#f2f2f5] text-[#656982]",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-[11px] font-medium ${styles[status]}`}
    >
      {status === "Live" ? "In Progress" : status}
    </span>
  );
};

export default MeetingsPage;