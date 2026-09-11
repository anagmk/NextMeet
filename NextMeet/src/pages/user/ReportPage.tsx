// pages/user/ReportPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type QuestionStatus = "passed" | "failed" | "not_submitted";

type QuestionEvaluation = {
  questionId: string;
  title: string;
  description: string;
  solved: boolean;
  status?: QuestionStatus;
  isSubmitted?: boolean;
  finalCode?: string;
  language?: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
};

type ParticipantSummary = {
  userId: string;
  name: string;
  email: string;
  role: "host" | "participant";
  joinedAt?: string;
  leftAt?: string;
};

type Report = {
  _id: string;
  meetingId: string;
  participants: ParticipantSummary[];
  questionEvaluations: QuestionEvaluation[];
  overallResult?: "passed" | "failed";
  totalQuestions?: number;
  questionsPassed?: number;
  questionsFailed?: number;
  questionsNotSubmitted?: number;
  overallScore: number;
  overallSummary: string;
  hostNotes: string;
  isPublished?: boolean;
  generatedAt: string;
};

const statusStyles: Record<QuestionStatus, { label: string; className: string }> = {
  passed: { label: "Passed", className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  failed: { label: "Failed", className: "bg-red-500/10 text-red-400 border border-red-500/20" },
  not_submitted: { label: "Not Submitted", className: "bg-amber-500/10 text-amber-300 border border-amber-500/20" },
};

export default function ReportPage() {
  const { meetingCode } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState("");
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/meetings/${meetingCode}/report`,
          { credentials: "include" },
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Report not available yet.");
          return;
        }
        setReport(data.report);
        setIsHost(Boolean(data.isHost));
        setNotes(data.report.hostNotes || "");
      } catch (err) {
        setError("Could not reach the server.");
        console.error("Fetch report error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [meetingCode]);

  const saveNotes = async () => {
    setIsSaving(true);
    setSaveStatus("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/meetings/${meetingCode}/report`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostNotes: notes }),
        },
      );
      if (!res.ok) throw new Error("Failed to save notes");
      setSaveStatus("Saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (err) {
      setSaveStatus("Failed to save");
      console.error("Save notes error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const publishReport = async () => {
    setIsPublishing(true);
    setPublishStatus("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/meetings/${meetingCode}/report/publish`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Unable to publish the report.");
      }

      setReport((current) => (current ? { ...current, isPublished: true } : current));
      setPublishStatus("Report published successfully.");
    } catch (err) {
      setPublishStatus(err instanceof Error ? err.message : "Unable to publish the report.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafd] text-[#171a3a]">
        <p className="text-sm text-[#656982]">Loading interview report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafd] text-[#171a3a]">
        <p className="text-sm text-red-600">{error || "Report not found."}</p>
      </div>
    );
  }

  const candidate = report.participants.find((p) => p.role === "participant") ?? report.participants[0];
  const totalQuestions = report.totalQuestions ?? report.questionEvaluations.length;
  const questionsPassed = report.questionsPassed ?? report.questionEvaluations.filter((q) => (q.status ?? (q.solved ? "passed" : "failed")) === "passed").length;
  const questionsFailed = report.questionsFailed ?? report.questionEvaluations.filter((q) => (q.status ?? (q.solved ? "passed" : "failed")) === "failed").length;
  const questionsNotSubmitted = report.questionsNotSubmitted ?? report.questionEvaluations.filter((q) => (q.status ?? (q.solved ? "passed" : "failed")) === "not_submitted").length;
  const overallStatus = report.overallResult === "passed" ? "passed" : "failed";

  return (
    <div className="min-h-screen bg-[#fafafd] p-6 text-[#171a3a] md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-2xl border border-[#e8e8ef] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#85899f]">
            Interview Report
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#171a3a]">
                {candidate ? candidate.name : "Candidate"}
              </h1>
              <p className="mt-2 text-sm text-[#656982]">
                {candidate?.email || "No email available"} · Generated {new Date(report.generatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                  overallStatus === "passed"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 border border-red-500/20"
                }`}
              >
                {overallStatus === "passed" ? "Passed" : "Failed"}
              </span>

              {isHost && (
                <span
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                    report.isPublished
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  }`}
                >
                  {report.isPublished ? "Published" : "Unpublished"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <StatBox label="Overall Score" value={`${report.overallScore}%`} accent="purple" />
          <StatBox label="Total Questions" value={String(totalQuestions)} accent="blue" />
          <StatBox label="Passed" value={String(questionsPassed)} accent="green" />
          <StatBox label="Failed" value={String(questionsFailed)} accent="red" />
          <StatBox label="Not Submitted" value={String(questionsNotSubmitted)} accent="amber" />
        </div>

        <div className="mb-6 rounded-2xl border border-[#e8e8ef] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#191c40]">Overall Summary</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4d5369]">{report.overallSummary}</p>
        </div>

        <div className="mb-6 rounded-2xl border border-[#e8e8ef] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#191c40]">Participants</h2>
          <div className="flex flex-col gap-2">
            {report.participants.map((p) => (
              <div
                key={p.userId}
                className="flex items-center justify-between rounded-xl border border-[#eeedf4] bg-[#fafafd] px-4 py-3"
              >
                <div>
                  <span className="font-medium text-[#30344f]">{p.name}</span>{" "}
                  <span className="text-[#85899f]">({p.role})</span>
                </div>
                <span className="text-xs text-[#85899f]">{p.email}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {report.questionEvaluations.map((qe) => {
            const status = (qe.status ?? (qe.solved ? "passed" : "failed")) as QuestionStatus;

            return (
              <div key={qe.questionId} className="rounded-2xl border border-[#e8e8ef] bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#191c40]">{qe.title}</h2>
                    <p className="mt-1 text-sm text-[#656982]">{qe.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusStyles[status].className}`}>
                      {statusStyles[status].label}
                    </span>
                    <span className="rounded-full bg-[#f0edff] px-3 py-1.5 text-xs font-semibold text-[#5b3fd6]">
                      {qe.score}/100
                    </span>
                  </div>
                </div>

                <p className="mb-4 text-sm leading-relaxed text-[#4d5369]">{qe.summary}</p>

                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#85899f]">
                      Strengths
                    </h3>
                    <ul className="space-y-2 text-sm text-[#4d5369]">
                      {(qe.strengths.length ? qe.strengths : ["No strengths captured for this response."]).map((item, index) => (
                        <li key={`${qe.questionId}-strength-${index}`} className="flex gap-2">
                          <span className="text-emerald-500">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#85899f]">
                      Weaknesses
                    </h3>
                    <ul className="space-y-2 text-sm text-[#4d5369]">
                      {(qe.weaknesses.length ? qe.weaknesses : ["No major weaknesses were identified in the submitted answer."]).map((item, index) => (
                        <li key={`${qe.questionId}-weakness-${index}`} className="flex gap-2">
                          <span className="text-red-500">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {qe.finalCode && (
                  <details className="overflow-hidden rounded-xl border border-[#e8e8ef] bg-[#fafafd]">
                    <summary className="cursor-pointer list-none px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#85899f]">
                      View submitted code {qe.language ? `(${qe.language})` : ""}
                    </summary>
                    <pre className="overflow-x-auto border-t border-[#e8e8ef] bg-[#111827] p-4 text-xs text-[#e5e7eb]">
                      {qe.finalCode}
                    </pre>
                  </details>
                )}
              </div>
            );
          })}
        </div>

        {isHost && (
          <div className="mt-6 rounded-2xl border border-[#e8e8ef] bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-[#191c40]">Report Publishing</h2>
              <button
                type="button"
                onClick={publishReport}
                disabled={isPublishing || Boolean(report.isPublished)}
                className="rounded-lg bg-[#5b3fd6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4d32c5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPublishing ? "Publishing..." : report.isPublished ? "Published" : "Publish Report"}
              </button>
            </div>
            <p className="text-sm text-[#656982]">
              {report.isPublished
                ? "This report has already been published to the candidate."
                : "This report is private by default. Publish it when you are ready for the candidate to view it."}
            </p>
            {publishStatus && (
              <p className={`mt-3 text-sm ${publishStatus.includes("success") ? "text-emerald-600" : "text-red-600"}`}>
                {publishStatus}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-[#e8e8ef] bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-[#191c40]">Host Notes</h2>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={5}
            placeholder="Add notes about this interview..."
            className="w-full resize-y rounded-xl border border-[#e8e8ef] bg-[#fafafd] px-3 py-2.5 text-sm text-[#30344f] outline-none placeholder:text-[#85899f] focus:border-[#5b3fd6]"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={saveNotes}
              disabled={isSaving}
              className="rounded-lg bg-[#5b3fd6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4d32c5] disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Notes"}
            </button>
            {saveStatus && <span className="text-xs text-[#85899f]">{saveStatus}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent: "purple" | "blue" | "green" | "red" | "amber" }) {
  const accentClasses: Record<string, string> = {
    purple: "bg-[#f0edff] text-[#5b3fd6]",
    blue: "bg-[#edf5ff] text-[#2d6cdf]",
    green: "bg-[#eafaf0] text-[#1d9d61]",
    red: "bg-[#ffecef] text-[#d92d20]",
    amber: "bg-[#fff4e5] text-[#b76e00]",
  };

  return (
    <div className="rounded-2xl border border-[#e8e8ef] bg-white p-4 shadow-sm">
      <div className={`mb-3 inline-flex rounded-lg px-2.5 py-2 text-sm font-semibold ${accentClasses[accent]}`}>
        {value}
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#85899f]">{label}</p>
    </div>
  );
}
