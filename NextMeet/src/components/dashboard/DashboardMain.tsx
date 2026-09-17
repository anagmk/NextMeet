// components/dashboard/DashboardContent.tsx

import { Link } from "react-router-dom";

import {
  CalendarPlus,
  LogIn,
  Video,
  ArrowRight,
  Clock3,
  Users,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react";

import { useUser } from "../../context/UserContext";

export default function DashboardContent() {
  const { user } = useUser();

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="dashboard-page flex flex-col gap-6 bg-[#f7f8fc] p-6 md:p-8">
      {/* =========================================================
          GREETING + QUICK ACTIONS
      ========================================================= */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Greeting */}
        <div className="relative overflow-hidden rounded-2xl border border-[#e3e5ed] bg-white p-6 shadow-[0_4px_20px_rgba(31,35,55,0.04)]">
          {/* Decorative background */}
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#5146e5]/5" />
          <div className="absolute -bottom-20 right-20 h-32 w-32 rounded-full bg-[#7c6cf2]/5" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-[#f0efff] bg-[#e9e6ff] text-xl font-semibold text-[#5b3fd6]">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-sm text-[#656982]">Good morning,</p>

                <h1 className="mt-0.5 text-xl font-bold text-[#171a3a]">
                  {user?.name ?? "..."} 👋
                </h1>

                <p className="mt-1 text-xs text-[#8a8fa3]">
                  Ready to start your next meeting?
                </p>
              </div>
            </div>

            {/* Upgrade */}
            <button
              disabled
              title="Plans are not available yet"
              className="hidden cursor-not-allowed rounded-lg border border-[#e2def8] bg-[#f3f1fc] px-4 py-2.5 text-sm font-medium text-[#a49fd1] sm:block"
            >
              Upgrade Plan
            </button>
          </div>

          {/* Small stats */}
          <div className="relative mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#ececf2] bg-[#fafafd] p-3">
              <div className="flex items-center gap-2">
                <Video size={14} className="text-[#5b3fd6]" />
                <span className="text-[11px] text-[#8a8fa3]">Meetings</span>
              </div>

              <p className="mt-2 text-lg font-bold text-[#171a3a]">0</p>
            </div>

            <div className="rounded-xl border border-[#ececf2] bg-[#fafafd] p-3">
              <div className="flex items-center gap-2">
                <Clock3 size={14} className="text-[#4c6ef5]" />
                <span className="text-[11px] text-[#8a8fa3]">Hours</span>
              </div>

              <p className="mt-2 text-lg font-bold text-[#171a3a]">0h</p>
            </div>

            <div className="rounded-xl border border-[#ececf2] bg-[#fafafd] p-3">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#22a06b]" />
                <span className="text-[11px] text-[#8a8fa3]">Participants</span>
              </div>

              <p className="mt-2 text-lg font-bold text-[#171a3a]">0</p>
            </div>
          </div>
        </div>

        {/* =========================================================
            QUICK ACTIONS
        ========================================================= */}
        <div className="rounded-2xl border border-[#e3e5ed] bg-white p-6 shadow-[0_4px_20px_rgba(31,35,55,0.04)]">
          <h2 className="text-base font-semibold text-[#171a3a]">
            Quick Actions
          </h2>

          <p className="mt-0.5 text-xs text-[#8a8fa3]">
            Start, join, or schedule a meeting instantly
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {/* Schedule */}
            <Link
              to="/create-meeting"
              className="group flex flex-col items-center gap-2 rounded-xl border border-[#e2e7fb] bg-[#f5f7ff] px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-[#cfd7ff] hover:bg-[#eef2ff] hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4c6ef5] text-white shadow-sm">
                <CalendarPlus size={18} />
              </div>

              <span className="text-xs font-medium text-[#2f3552]">
                Schedule
              </span>
            </Link>

            {/* Join */}
            <Link
              to="/join"
              className="group flex flex-col items-center gap-2 rounded-xl border border-[#dcefe4] bg-[#f1fbf5] px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-[#c5e7d3] hover:bg-[#eaf9f0] hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c07a] text-white shadow-sm">
                <LogIn size={18} />
              </div>

              <span className="text-xs font-medium text-[#2f3552]">Join</span>
            </Link>

            {/* Host */}
            <Link
              to="/create-meeting"
              className="group flex flex-col items-center gap-2 rounded-xl border border-[#e4def9] bg-[#f5f2ff] px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-[#d8ccfa] hover:bg-[#eee9ff] hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5b3fd6] text-white shadow-sm">
                <Video size={18} />
              </div>

              <span className="text-xs font-medium text-[#2f3552]">Host</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          PROMOTIONAL BANNER
      ========================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-[#dcd9fb] bg-gradient-to-r from-[#f1efff] via-[#f7f6ff] to-white shadow-[0_4px_20px_rgba(31,35,55,0.04)]">
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-[#5b3fd6]/10" />
        {/* <div className="absolute -bottom-20 right-32 h-36 w-36 rounded-full bg-[#7c6cf2]/10" /> */}

        {/* <div className="relative flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center md:p-7">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#5b3fd6] shadow-sm ring-1 ring-[#e4e0fb]">
              <Sparkles size={20} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">

                <h2 className="text-base font-bold text-[#171a3a]">
                  Make every interview count
                </h2>

                <span className="rounded-full bg-[#e8e4ff] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#5b3fd6]">
                  NextMeet
                </span>

              </div>

              <p className="mt-1 max-w-xl text-xs leading-5 text-[#6d7285]">
                Bring video, collaborative coding, and AI-powered
                interview tools together in one workspace.
              </p>
            </div>

          </div>

          <Link
            to="/about"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#5b3fd6] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4c32c2]"
          >
            Explore NextMeet
            <ArrowRight size={14} />
          </Link>

        </div> */}
      </div>

      {/* =========================================================
          USAGE + SECURITY + PRODUCT STATUS
      ========================================================= */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Usage */}
        <div className="rounded-2xl border border-[#e3e5ed] bg-white p-6 shadow-[0_4px_20px_rgba(31,35,55,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#8a8fa3]">Your Usage</p>

              <h3 className="mt-1 text-base font-bold text-[#171a3a]">
                Free Plan
              </h3>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1edff] text-[#5b3fd6]">
              <Zap size={17} />
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#777d90]">Meeting usage</span>

              <span className="font-semibold text-[#34384a]">0 / 10</span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eeeef4]">
              <div className="h-full w-0 rounded-full bg-[#5b3fd6]" />
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-5 text-[#8a8fa3]">
            Start creating meetings to see your usage here.
          </p>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-[#e3e5ed] bg-white p-6 shadow-[0_4px_20px_rgba(31,35,55,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#8a8fa3]">Security</p>

              <h3 className="mt-1 text-base font-bold text-[#171a3a]">
                Your account is protected
              </h3>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf9f0] text-[#22a06b]">
              <ShieldCheck size={17} />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 text-xs text-[#62697c]">
              <CheckCircle2 size={14} className="text-[#22a06b]" />
              Account verified
            </div>

            <div className="flex items-center gap-2 text-xs text-[#62697c]">
              <CheckCircle2 size={14} className="text-[#22a06b]" />
              Secure meeting access
            </div>

            <div className="flex items-center gap-2 text-xs text-[#62697c]">
              <CheckCircle2 size={14} className="text-[#22a06b]" />
              Protected sessions
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="rounded-2xl border border-[#e3e5ed] bg-white p-6 shadow-[0_4px_20px_rgba(31,35,55,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#8a8fa3]">NextMeet</p>

              <h3 className="mt-1 text-base font-bold text-[#171a3a]">
                Everything is ready
              </h3>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2ff] text-[#4c6ef5]">
              <Video size={17} />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[#ececf2] bg-[#fafafd] p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#22c07a]" />

              <span className="text-xs font-medium text-[#34384a]">
                Meeting services operational
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-[#8a8fa3]">
              Create or join a meeting whenever you're ready.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          ABOUT NEXTMEET
      ========================================================= */}
      <div className="overflow-hidden rounded-2xl border border-[#e3e5ed] bg-white shadow-[0_4px_20px_rgba(31,35,55,0.04)]">
        <div className="grid gap-0 md:grid-cols-2 md:items-stretch">
          {/* Text */}
          <div className="p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8a8fa3]">
              About NextMeet
            </p>

            <h2 className="mt-2 text-2xl font-bold text-[#171a3a]">
              Connect. Collaborate. Create.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#656982]">
              NextMeet brings live video, a shared code editor, and AI-generated
              interview questions into one place — so hosts can run real
              technical interviews, not just talk over video.
            </p>

            {/* Feature mini cards */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#ececf2] bg-[#fafafd] p-3">
                <Video size={16} className="text-[#5b3fd6]" />

                <p className="mt-2 text-xs font-semibold text-[#34384a]">
                  Live Meetings
                </p>

                <p className="mt-1 text-[10px] leading-4 text-[#8a8fa3]">
                  Reliable video collaboration.
                </p>
              </div>

              <div className="rounded-xl border border-[#ececf2] bg-[#fafafd] p-3">
                <Sparkles size={16} className="text-[#5b3fd6]" />

                <p className="mt-2 text-xs font-semibold text-[#34384a]">
                  AI Assistance
                </p>

                <p className="mt-1 text-[10px] leading-4 text-[#8a8fa3]">
                  Smarter interview workflows.
                </p>
              </div>
            </div>

            <Link
              to="/about"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#5b3fd6] transition hover:text-[#4530b5] hover:underline"
            >
              Learn more
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Visual */}
          <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden border-t border-[#ececf2] bg-[#f6f5fb] p-8 md:border-l md:border-t-0">
            {/* Decorative circles */}
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#5b3fd6]/10" />

            <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-[#4c6ef5]/10" />

            {/* Mock application */}
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[#dedee8] bg-white shadow-[0_12px_35px_rgba(31,35,55,0.12)]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#ececf2] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5b3fd6]">
                    <Video size={12} className="text-white" />
                  </div>

                  <span className="text-xs font-semibold text-[#25293a]">
                    NextMeet
                  </span>
                </div>

                <span className="rounded-full bg-[#eaf9f0] px-2 py-1 text-[9px] font-semibold text-[#22a06b]">
                  Live
                </span>
              </div>

              {/* Video area */}
              <div className="grid grid-cols-2 gap-2 bg-[#f3f4f8] p-3">
                <div className="relative aspect-video overflow-hidden rounded-lg border border-[#d9dbe4] bg-gradient-to-br from-[#dedbff] to-[#f1f0ff]">
                  <div className="absolute bottom-2 left-2 rounded bg-black/50 px-1.5 py-0.5 text-[8px] text-white">
                    Candidate
                  </div>
                </div>

                <div className="relative aspect-video overflow-hidden rounded-lg border border-[#d9dbe4] bg-gradient-to-br from-[#dcecff] to-[#f2f7ff]">
                  <div className="absolute bottom-2 left-2 rounded bg-black/50 px-1.5 py-0.5 text-[8px] text-white">
                    Interviewer
                  </div>
                </div>
              </div>

              {/* Bottom */}
              <div className="flex items-center justify-between border-t border-[#ececf2] px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold text-[#34384a]">
                    Technical Interview
                  </p>

                  <p className="mt-0.5 text-[9px] text-[#8a8fa3]">
                    Collaborative session
                  </p>
                </div>

                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5b3fd6] text-white">
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
