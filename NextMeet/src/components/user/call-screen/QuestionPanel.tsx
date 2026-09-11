import { useState } from "react";
import { Sparkles, X } from "lucide-react";

type GeneratedQuestion = {
  questionId: string;
  title: string;
  description: string;
  starterCode: string;
  language: string;
  functionName: string; // add this too, while you're here — it's used elsewhere
  testCases: {
    args: string[]; // was: input: string
    expectedOutput: string;
    isHidden: boolean;
  }[];
};

type TestResult = {
  label: string;
  passed: boolean;
  executionError?: string;
};

type QuestionPanelProps = {
  question: GeneratedQuestion | null;
  testResults: TestResult[];
  onQuestionGenerated: (question: GeneratedQuestion) => void;
  meetingCode?: string;
  isHost: boolean;
};

const QuestionPanel = ({
  question,
  testResults,
  onQuestionGenerated,
  meetingCode,
  isHost,
}: QuestionPanelProps) => {
  const [isQuestionChooserOpen, setIsQuestionChooserOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    level: "Junior",
    domain: "Backend",
    language: "javascript",
    jobRole: "",
    description: "",
  });
  const [manualData, setManualData] = useState({
    title: "",
    description: "",
    language: "javascript",
    testCases: [
      { input: "", expectedOutput: "" },
      { input: "", expectedOutput: "" },
    ],
  });

  const openQuestionChooser = () => {
    setError("");
    setIsQuestionChooserOpen(true);
  };

  const handleGenerate = async () => {
    if (!meetingCode || !formData.jobRole.trim() || !isHost) return;

    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/question/generate`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, meetingCode }),
        },
      );

      const data = (await res.json()) as GeneratedQuestion & {
        message?: string;
      };

      if (!res.ok) {
        setError(data.message || "Failed to generate question");
        return;
      }

      onQuestionGenerated(data);
      setIsFormOpen(false);
    } catch (err) {
      setError("Could not reach the server");
      console.error("Question generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualCreate = async () => {
    if (!meetingCode || !isHost) return;
    const hasEmptyField =
      !manualData.title.trim() ||
      !manualData.description.trim() ||
      manualData.testCases.some(
        (testCase) => !testCase.input.trim() || !testCase.expectedOutput.trim(),
      );
    if (hasEmptyField) {
      setError("Complete the question and both test cases before saving.");
      return;
    }

    setIsCreatingManual(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/question/manual`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...manualData, meetingCode }),
        },
      );
      const data = (await res.json()) as GeneratedQuestion & {
        message?: string;
      };
      if (!res.ok) {
        setError(data.message || "Failed to create manual question");
        return;
      }
      onQuestionGenerated(data);
      setIsManualFormOpen(false);
    } catch (err) {
      setError("Could not reach the server");
      console.error("Manual question creation error:", err);
    } finally {
      setIsCreatingManual(false);
    }
  };

  const updateManualTestCase = (
    index: number,
    field: "input" | "expectedOutput",
    value: string,
  ) => {
    setManualData((current) => ({
      ...current,
      testCases: current.testCases.map((testCase, testIndex) =>
        testIndex === index ? { ...testCase, [field]: value } : testCase,
      ),
    }));
  };

  return (
    <div className="relative h-full w-full overflow-y-auto bg-[#0f1117] p-5 text-white">
      {!question && (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5146e5]/15 text-[#5146e5]">
            <Sparkles size={22} />
          </div>
          <p className="text-sm text-[#8b8f9d]">No question generated yet</p>
          {isHost ? (
            <button
              onClick={openQuestionChooser}
              className="rounded-lg bg-[#5146e5] px-4 py-2 text-sm text-white transition hover:bg-[#4338d9]"
            >
              New Question
            </button>
          ) : (
            <p className="text-sm text-[#8b8f9d]">
              Waiting for the host to generate a question.
            </p>
          )}
        </div>
      )}

      {question && (
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{question.title}</h2>
            <div className="flex shrink-0 items-center gap-1.5">
              {testResults.map((result, index) => {
                const status = result.executionError
                  ? "Error"
                  : result.passed
                    ? "Passed"
                    : "Failed";
                const className = result.executionError
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                  : result.passed
                    ? "border-green-500/30 bg-green-500/10 text-green-400"
                    : "border-red-500/30 bg-red-500/10 text-red-400";
                return (
                  <span
                    key={`${result.label}-${index}`}
                    title={`${result.label}: ${status}`}
                    className={`rounded-md border px-2 py-1 text-[10px] font-medium ${className}`}
                  >
                    T{index + 1} {status}
                  </span>
                );
              })}
              {isHost && (
                <button
                  onClick={openQuestionChooser}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#8b8f9d] transition hover:bg-white/5"
                >
                  New Question
                </button>
              )}
            </div>
          </div>

          <p className="mb-5 whitespace-pre-wrap text-sm leading-relaxed text-[#d7d7dc]">
            {question.description}
          </p>
          <p className="mb-5 rounded-lg border border-[#5146e5]/25 bg-[#5146e5]/10 px-3 py-2 text-xs text-[#c4c0ff]">
            Implement <code>solution(input)</code>. The platform calls it
            automatically for both test cases when you run the code.
          </p>

          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-[#6b6f80]">
              Sample Test Cases
            </h3>
            <div className="flex flex-col gap-2">
              {question.testCases
                ?.filter((tc) => !tc.isHidden)
                .slice(0, 2)
                .map((tc, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-white/10 bg-[#141923] p-3 text-xs"
                  >
                    <div className="mb-1 text-[#8b8f9d]">
                      Input:{" "}
                      <span className="text-[#d7d7dc]">
                        {tc.args?.join(", ")}
                      </span>
                    </div>
                    <div className="text-[#8b8f9d]">
                      Expected:{" "}
                      <span className="text-[#d7d7dc]">
                        {tc.expectedOutput}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {isQuestionChooserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#15151d] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Question</h2>
              <button
                onClick={() => setIsQuestionChooserOpen(false)}
                className="text-[#8b8f9d] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-3">
              <button
                onClick={() => {
                  setIsQuestionChooserOpen(false);
                  setIsManualFormOpen(true);
                  setError("");
                }}
                className="rounded-xl border border-white/10 bg-[#1b1f2a] p-4 text-left transition hover:border-[#5146e5]/60"
              >
                <span className="block text-sm font-medium">Manually</span>
                <span className="mt-1 block text-xs text-[#8b8f9d]">
                  Write the problem and two test cases yourself.
                </span>
              </button>
              <button
                onClick={() => {
                  setIsQuestionChooserOpen(false);
                  setIsFormOpen(true);
                  setError("");
                }}
                className="rounded-xl border border-[#5146e5]/40 bg-[#5146e5]/10 p-4 text-left transition hover:bg-[#5146e5]/20"
              >
                <span className="block text-sm font-medium">Generate</span>
                <span className="mt-1 block text-xs text-[#b8b3ff]">
                  Create a question with AI.
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isManualFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#15151d] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Create Question Manually
              </h2>
              <button
                onClick={() => setIsManualFormOpen(false)}
                className="text-[#8b8f9d] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <input
                value={manualData.title}
                onChange={(event) =>
                  setManualData({ ...manualData, title: event.target.value })
                }
                placeholder="Question title"
                className="w-full rounded-lg bg-[#282832] px-3 py-2 text-sm outline-none placeholder:text-[#6b6f80]"
              />
              <textarea
                value={manualData.description}
                onChange={(event) =>
                  setManualData({
                    ...manualData,
                    description: event.target.value,
                  })
                }
                placeholder="Problem statement, input format, and output format"
                rows={5}
                className="w-full resize-y rounded-lg bg-[#282832] px-3 py-2 text-sm outline-none placeholder:text-[#6b6f80]"
              />
              <select
                value={manualData.language}
                onChange={(event) =>
                  setManualData({ ...manualData, language: event.target.value })
                }
                className="w-full rounded-lg bg-[#282832] px-3 py-2 text-sm outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="typescript">TypeScript</option>
                <option value="go">Go</option>
              </select>
              <p className="rounded-lg border border-[#5146e5]/30 bg-[#5146e5]/10 px-3 py-2 text-xs text-[#c4c0ff]">
                The editor will provide a language-specific{" "}
                <code>solution(input)</code> function. Candidates only write the
                function body; test execution calls it automatically.
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-[#8b8f9d]">
                Two test cases
              </p>
              {manualData.testCases.map((testCase, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-xl border border-white/10 bg-[#11131b] p-3 sm:grid-cols-2"
                >
                  <textarea
                    value={testCase.input}
                    onChange={(event) =>
                      updateManualTestCase(index, "input", event.target.value)
                    }
                    placeholder={`Test ${index + 1} input`}
                    rows={3}
                    className="resize-y rounded-lg bg-[#282832] px-3 py-2 font-mono text-xs outline-none placeholder:text-[#6b6f80]"
                  />
                  <textarea
                    value={testCase.expectedOutput}
                    onChange={(event) =>
                      updateManualTestCase(
                        index,
                        "expectedOutput",
                        event.target.value,
                      )
                    }
                    placeholder={`Test ${index + 1} expected output`}
                    rows={3}
                    className="resize-y rounded-lg bg-[#282832] px-3 py-2 font-mono text-xs outline-none placeholder:text-[#6b6f80]"
                  />
                </div>
              ))}
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsManualFormOpen(false)}
                className="rounded-lg px-4 py-2 text-sm text-[#8b8f9d] transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleManualCreate}
                disabled={isCreatingManual}
                className="rounded-lg bg-[#5146e5] px-4 py-2 text-sm text-white transition hover:bg-[#4338d9] disabled:opacity-50"
              >
                {isCreatingManual ? "Saving..." : "Save Question"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15151d] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Generate Interview Question
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-[#8b8f9d] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs text-[#8b8f9d]">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                  className="w-full rounded-lg bg-[#282832] px-3 py-2 text-sm outline-none"
                >
                  <option>Intern</option>
                  <option>Fresher</option>
                  <option>Junior</option>
                  <option>Intermediate</option>
                  <option>Senior</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#8b8f9d]">
                  Domain
                </label>
                <select
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData({ ...formData, domain: e.target.value })
                  }
                  className="w-full rounded-lg bg-[#282832] px-3 py-2 text-sm outline-none"
                >
                  <option>Frontend</option>
                  <option>Backend</option>
                  <option>Full Stack</option>
                  <option>Mobile</option>
                  <option>DevOps</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#8b8f9d]">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  className="w-full rounded-lg bg-[#282832] px-3 py-2 text-sm outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#8b8f9d]">
                  Job Role
                </label>
                <input
                  type="text"
                  value={formData.jobRole}
                  onChange={(e) =>
                    setFormData({ ...formData, jobRole: e.target.value })
                  }
                  placeholder="e.g. React Developer"
                  className="w-full rounded-lg bg-[#282832] px-3 py-2 text-sm outline-none placeholder:text-[#6b6f80]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#8b8f9d]">
                  Additional context (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  maxLength={150}
                  placeholder="e.g. focus on async patterns"
                  className="w-full resize-none rounded-lg bg-[#282832] px-3 py-2 text-sm outline-none placeholder:text-[#6b6f80]"
                  rows={2}
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg px-4 py-2 text-sm text-[#8b8f9d] transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !formData.jobRole.trim()}
                className="rounded-lg bg-[#5146e5] px-4 py-2 text-sm text-white transition hover:bg-[#4338d9] disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPanel;
