import { useEffect, useMemo, useState } from "react";
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
  "Upcoming",
  "History",
  "Scheduled",
] as const;

type Tab = (typeof tabs)[number];

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("All Meetings");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const apiUrl = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");
        const response = await fetch(`${apiUrl}/user/meetings`, {
          credentials: "include",
        });
        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(data.message || "Unable to load meetings");
        }

        setMeetings(Array.isArray(data) ? data.map(formatMeeting) : []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load meetings");
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, []);

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const matchesSearch =
        meeting.title.toLowerCase().includes(search.toLowerCase()) ||
        meeting.meetingId.toLowerCase().includes(search.toLowerCase()) ||
        meeting.host.toLowerCase().includes(search.toLowerCase());

      let matchesTab = true;

      if (activeTab === "Upcoming") {
        matchesTab =
          meeting.status === "Upcoming" ||
          meeting.status === "Live";
      }

      if (activeTab === "Scheduled") {
        matchesTab = meeting.status === "Scheduled";
      }

      if (activeTab === "History") {
        matchesTab = meeting.status === "Completed";
      }

      const matchesStatus =
        statusFilter === "All" ||
        meeting.status === statusFilter;

      return matchesSearch && matchesTab && matchesStatus;
    });
  }, [activeTab, meetings, search, statusFilter]);

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
              onClick={() => setActiveTab(tab)}
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
              {filteredMeetings.length} meetings found
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
                <option value="Upcoming">Upcoming</option>
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
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#eeeeF3] px-5 py-4">

          <p className="text-xs text-[#85899f]">
            Showing {filteredMeetings.length} of {meetings.length}
          </p>

          <div className="flex items-center gap-1">

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e2ea] text-[#9a9dad] disabled:cursor-not-allowed"
              disabled
            >
              ‹
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f0edff] text-xs font-medium text-[#5b3fd6]"
            >
              1
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md text-xs text-[#555a73] hover:bg-[#f5f4f9]"
            >
              2
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md text-xs text-[#555a73] hover:bg-[#f5f4f9]"
            >
              3
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e2ea] text-[#555a73] hover:bg-[#f5f4f9]"
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
};

const MeetingRow = ({ meeting }: MeetingRowProps) => {
  const isLive = meeting.status === "Live";

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
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
              isLive
                ? "border-[#6d5ce7] text-[#5b3fd6] hover:bg-[#f0edff]"
                : "border-[#dedee8] text-[#555a73] hover:border-[#cfc5ff] hover:text-[#5b3fd6]"
            }`}
          >
            {isLive || meeting.status === "Upcoming"
              ? "Join"
              : "View"}
          </button>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#85899f] transition hover:bg-[#f0edff] hover:text-[#5b3fd6]"
          >
            <MoreHorizontal size={17} />
          </button>

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

          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#85899f] hover:bg-[#f0edff]"
          >
            <MoreHorizontal size={17} />
          </button>

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
            className="rounded-lg border border-[#6d5ce7] px-4 py-2 text-xs font-medium text-[#5b3fd6] hover:bg-[#f0edff]"
          >
            {isLive || meeting.status === "Upcoming"
              ? "Join"
              : "View"}
          </button>

        </div>

      </div>
    </div>
  );
};

const ParticipantAvatars = ({ meeting }: MeetingRowProps) => {
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