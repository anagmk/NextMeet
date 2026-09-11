// pages/public/LandingPage.tsx

import { Link } from "react-router-dom";
import {
  Video,
  ShieldCheck,
  Users,
  Globe,
  Sparkles,
  Play,
  ArrowRight,
} from "lucide-react";

import candidateImage from "../../assets/candidate.jpg";
import interviewerImage from "../../assets/interviewer.jpg";

const features = [
  {
    icon: Video,
    title: "HD Video & Audio",
    description: "Crystal-clear calls with reliable performance.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Default",
    description: "Your meetings and sessions stay protected.",
  },
  {
    icon: Users,
    title: "Built for Interviews",
    description: "Conduct technical interviews with powerful tools.",
  },
  {
    icon: Globe,
    title: "Access Anywhere",
    description: "Join from any device, wherever you are.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#171a2b]">

      {/* ================= NAVBAR ================= */}
      <nav className="border-b border-[#e8e9ef] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5146e5] text-white shadow-sm">
              <Video size={18} />
            </div>

            <span className="text-lg font-bold tracking-tight">
              NextMeet
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#596174] transition hover:bg-[#f5f5f8] hover:text-[#171a2b]"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-[#5146e5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#453bd0]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>


      {/* ================= HERO ================= */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-24">

        <div className="grid items-center gap-14 lg:grid-cols-2">

          {/* Hero Content */}
          <div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dedcff] bg-[#f0efff] px-3.5 py-1.5 text-xs font-semibold text-[#5146e5]">
              <Sparkles size={13} />
              AI-powered technical interviews
            </div>

            {/* Heading */}
            <h1 className="mt-6 max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-[#171a2b] md:text-6xl">
              Smarter interviews.
              <br />
              Better hiring.
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-xl text-base leading-7 text-[#667085] md:text-lg">
              NextMeet combines video meetings, collaborative coding,
              and AI-powered interview tools to help teams evaluate
              candidates in real time.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                to="/register"
                className="flex items-center gap-2 rounded-lg bg-[#5146e5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#453bd0]"
              >
                Create a Meeting
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/join"
                className="flex items-center gap-2 rounded-lg border border-[#dfe1e8] bg-white px-6 py-3 text-sm font-semibold text-[#34384a] shadow-sm transition hover:bg-[#f8f8fa]"
              >
                <Play size={14} />
                Join a Meeting
              </Link>

            </div>

            {/* Trust */}
            <div className="mt-8 flex items-center gap-3 text-xs text-[#8a91a3]">

              <div className="flex -space-x-2">

                <div className="h-7 w-7 rounded-full border-2 border-white bg-[#d8d5ff]" />

                <div className="h-7 w-7 rounded-full border-2 border-white bg-[#c9e0ff]" />

                <div className="h-7 w-7 rounded-full border-2 border-white bg-[#d9f2e5]" />

                <div className="h-7 w-7 rounded-full border-2 border-white bg-[#ffe1cc]" />

              </div>

              <span>
                Trusted by teams building better hiring processes
              </span>

            </div>

          </div>


          {/* ================= VIDEO PREVIEW ================= */}
          <div className="relative">

            {/* Main Preview Card */}
            <div className="overflow-hidden rounded-2xl border border-[#dfe1e8] bg-white shadow-[0_20px_60px_rgba(31,35,55,0.10)] ring-1 ring-[#5146e5]/[0.03]">

              {/* Browser Header */}
              <div className="flex items-center gap-1.5 border-b border-[#ececf1] px-4 py-3">

                <span className="h-2.5 w-2.5 rounded-full bg-[#ffb4b4]" />

                <span className="h-2.5 w-2.5 rounded-full bg-[#ffd58a]" />

                <span className="h-2.5 w-2.5 rounded-full bg-[#a9dfb9]" />

              </div>


              {/* Meeting Area */}
              <div className="bg-[#f4f5f9] p-5">

                {/* ================= VIDEO BOXES ================= */}
                <div className="grid grid-cols-2 gap-3">

                  {/* Candidate */}
                  <div className="group relative aspect-video overflow-hidden rounded-xl border border-[#d6d8e2] bg-white shadow-[0_5px_18px_rgba(31,35,55,0.10)]">

                    <img
                      src={candidateImage}
                      alt="Candidate"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />

                    {/* Bottom Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                    {/* Candidate Label */}
                    <div className="absolute bottom-2.5 left-2.5 rounded-md border border-white/20 bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                      Candidate
                    </div>

                  </div>


                  {/* Interviewer */}
                  <div className="group relative aspect-video overflow-hidden rounded-xl border border-[#d6d8e2] bg-white shadow-[0_5px_18px_rgba(31,35,55,0.10)]">

                    <img
                      src={interviewerImage}
                      alt="Interviewer"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />

                    {/* Bottom Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                    {/* Interviewer Label */}
                    <div className="absolute bottom-2.5 left-2.5 rounded-md border border-white/20 bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                      Interviewer
                    </div>

                  </div>

                </div>


                {/* ================= CODE PANEL ================= */}
                <div className="mt-3 rounded-xl border border-[#e3e5ec] bg-white p-4 shadow-sm">

                  <div className="mb-3 flex items-center justify-between">

                    <span className="text-xs font-semibold text-[#34384a]">
                      Collaborative Code Editor
                    </span>

                    <span className="rounded-md bg-[#edecff] px-2 py-1 text-[10px] font-medium text-[#5146e5]">
                      JavaScript
                    </span>

                  </div>


                  {/* Code */}
                  <div className="space-y-2 font-mono text-[10px] text-[#7a8192]">

                    <div>
                      <span className="text-[#5146e5]">
                        function
                      </span>{" "}
                      solve(input) {"{"}
                    </div>

                    <div className="pl-4">
                      <span className="text-[#5146e5]">
                        return
                      </span>{" "}
                      result;
                    </div>

                    <div>
                      {"}"}
                    </div>

                  </div>

                </div>


                {/* ================= MEETING CONTROLS ================= */}
                <div className="mt-4 flex items-center justify-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e1e2e8] bg-white shadow-sm">
                    <Video
                      size={15}
                      className="text-[#596174]"
                    />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e1e2e8] bg-white shadow-sm">
                    <Users
                      size={15}
                      className="text-[#596174]"
                    />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ef4444] text-white shadow-sm">
                    <Video size={15} />
                  </div>

                </div>

              </div>

            </div>


            {/* ================= FLOATING AI CARD ================= */}
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-[#e4e5eb] bg-white p-4 shadow-lg sm:block">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edecff] text-[#5146e5]">
                  <Sparkles size={17} />
                </div>

                <div>

                  <p className="text-xs font-semibold text-[#25293a]">
                    AI Interview Assistant
                  </p>

                  <p className="mt-0.5 text-[11px] text-[#858b9b]">
                    Generating interview questions...
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= TRUST SECTION ================= */}
      <section className="border-y border-[#e7e8ed] bg-white">

        <div className="mx-auto max-w-7xl px-6 py-10">

          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#9aa0ae]">
            Built for modern teams
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-12 gap-y-5 text-sm font-semibold text-[#a1a6b2] md:gap-x-20">

            <span>STARTUPS</span>

            <span>TECH TEAMS</span>

            <span>EDUCATION</span>

            <span>RECRUITING</span>

            <span>ENTERPRISE</span>

          </div>

        </div>

      </section>


      {/* ================= ABOUT ================= */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">

        <div className="grid items-center gap-14 lg:grid-cols-2">

          {/* Visual */}
          <div className="overflow-hidden rounded-2xl border border-[#e4e5eb] bg-white p-3 shadow-sm">

            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#ecebff] to-[#f6f7fa] p-8">

              <div className="rounded-xl border border-white/80 bg-white p-5 shadow-lg">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs text-[#8b91a0]">
                      Interview Session
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      Frontend Developer
                    </p>

                  </div>

                  <span className="rounded-full bg-[#e9f8ef] px-2.5 py-1 text-[10px] font-semibold text-[#29945a]">
                    Live
                  </span>

                </div>


                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="aspect-video rounded-lg bg-[#e5e3ff]" />

                  <div className="aspect-video rounded-lg bg-[#e2efff]" />

                </div>


                <div className="mt-4 rounded-lg bg-[#f6f7fa] p-3">

                  <div className="h-2 w-2/3 rounded bg-[#dfe1e8]" />

                  <div className="mt-2 h-2 w-1/2 rounded bg-[#e7e8ed]" />

                </div>

              </div>

            </div>

          </div>


          {/* Content */}
          <div>

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5146e5]">
              About NextMeet
            </span>

            <h2 className="mt-3 max-w-lg text-3xl font-bold tracking-tight md:text-4xl">
              More than just a video meeting
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#667085] md:text-base">
              NextMeet is designed for modern interviews and
              collaborative conversations. Bring video, coding,
              questions, and evaluation into a single workspace.
            </p>

            <Link
              to="/about"
              className="mt-7 inline-flex items-center gap-2 rounded-lg border border-[#dfe1e8] bg-white px-5 py-2.5 text-sm font-semibold text-[#34384a] shadow-sm transition hover:bg-[#f7f7f9]"
            >
              Learn More
              <ArrowRight size={15} />
            </Link>

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section className="border-y border-[#e7e8ed] bg-white">

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="text-center">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5146e5]">
              Why NextMeet
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Everything you need
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#667085]">
              A focused workspace for meetings, interviews,
              collaboration, and evaluation.
            </p>

          </div>


          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {features.map((feature) => {

              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-[#e4e5eb] bg-white p-6 transition hover:-translate-y-1 hover:border-[#d7d4ff] hover:shadow-md"
                >

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#efeeff] text-[#5146e5]">
                    <Icon size={19} />
                  </div>

                  <h3 className="mt-5 text-sm font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-[#73798a]">
                    {feature.description}
                  </p>

                </div>
              );

            })}

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">

        <div className="overflow-hidden rounded-2xl bg-[#5146e5] px-8 py-14 text-center text-white md:px-16">

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d9d6ff]">
            Get started
          </p>

          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Ready to run smarter interviews?
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#d9d6ff]">
            Create your NextMeet account and start your first
            interview in minutes.
          </p>

          <Link
            to="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#5146e5] shadow-sm transition hover:bg-[#f5f4ff]"
          >
            Create Your Account
            <ArrowRight size={15} />
          </Link>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[#e5e6eb] bg-white">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-7 text-xs text-[#7b8190] sm:flex-row">

          <span>
            © {new Date().getFullYear()} NextMeet. All rights reserved.
          </span>

          <div className="flex gap-5">

            <Link
              to="/about"
              className="transition hover:text-[#5146e5]"
            >
              About
            </Link>

            <Link
              to="/login"
              className="transition hover:text-[#5146e5]"
            >
              Log in
            </Link>

          </div>

        </div>

      </footer>

    </div>
  );
}