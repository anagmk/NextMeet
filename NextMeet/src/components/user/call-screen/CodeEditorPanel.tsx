import Editor from "@monaco-editor/react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import QuestionPanel from "./QuestionPanel";

type GeneratedQuestion = {
  questionId: string;
  title: string;
  description: string;
  starterCode: string;
  language: string;
  functionName: string;
  testCases: {
    args: string[];
    expectedOutput: string;
    isHidden: boolean;
  }[];
};

type TestResult = {
  label: string;
  passed: boolean;
  hidden: boolean;
  args: string[];
  expected: string;
  actual: string;
  executionError?: string;
};

type JavaScriptRunResult = {
  stdout: string;
  stderr: string;
};

const runJavaScript = (source: string): JavaScriptRunResult => {
  const logs: string[] = [];
  const errors: string[] = [];
  const browserConsole = {
    log: (...values: unknown[]) => logs.push(values.map(String).join(" ")),
    info: (...values: unknown[]) => logs.push(values.map(String).join(" ")),
    warn: (...values: unknown[]) => logs.push(values.map(String).join(" ")),
    error: (...values: unknown[]) => errors.push(values.map(String).join(" ")),
  };

  try {
    const result = new Function("console", source)(browserConsole);
    if (result !== undefined && logs.length === 0) logs.push(String(result));
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  return { stdout: logs.join("\n"), stderr: errors.join("\n") };
};

const runQuestionTests = (
  source: string,
  question: GeneratedQuestion,
): TestResult[] =>
  question.testCases.slice(0, 2).map((testCase, index) => {
    try {
      const args = testCase.args.join(", ");
      const actual = new Function(
        `${source}\nreturn JSON.stringify(${question.functionName}(${args}));`,
      )();
      const actualOutput = actual === undefined ? "undefined" : String(actual);

      return {
        label: `Test ${index + 1}`,
        passed: actualOutput.trim() === testCase.expectedOutput.trim(),
        hidden: testCase.isHidden,
        args: testCase.args,
        expected: testCase.expectedOutput,
        actual: actualOutput,
      };
    } catch (error) {
      return {
        label: `Test ${index + 1}`,
        passed: false,
        hidden: testCase.isHidden,
        args: testCase.args,
        expected: testCase.expectedOutput,
        actual: "",
        executionError: error instanceof Error ? error.message : String(error),
      };
    }
  });

type CodeEditorPanelProps = {
  code: string;
  onCodeChange: (value: string | undefined) => void;
  onClose: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  socket: Socket | null;
  meetingCode?: string;
  isHost: boolean;
  question: GeneratedQuestion | null;
  onQuestionGenerated: (question: GeneratedQuestion) => void;
};

export default function CodeEditorPanel({
  code,
  onCodeChange,
  onClose,
  isFullscreen,
  onToggleFullscreen,
  socket,
  meetingCode,
  isHost,
  question,
  onQuestionGenerated,
}: CodeEditorPanelProps) {
  const language = "javascript";
  const [output, setOutput] = useState(
    "Click Run to see your code output here.",
  );
  const [isQuestionPopupOpen, setIsQuestionPopupOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isFailedSubmissionConfirmation, setIsFailedSubmissionConfirmation] =
    useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState(
    "Do you want to submit your answer?",
  );
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [terminalHeight, setTerminalHeight] = useState(150);
  const [codePanelWidth, setCodePanelWidth] = useState(50);
  const [isTerminalResizing, setIsTerminalResizing] = useState(false);
  const [isCodeResizing, setIsCodeResizing] = useState(false);
  const terminalDragStartYRef = useRef<number | null>(null);
  const startTerminalHeightRef = useRef(terminalHeight);
  const codeDragStartXRef = useRef<number | null>(null);
  const startCodePanelWidthRef = useRef(codePanelWidth);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleQuestionGenerated = (generatedQuestion: GeneratedQuestion) => {
    onQuestionGenerated(generatedQuestion);
    socket?.emit("question-generated", {
      meetingCode,
      question: generatedQuestion,
    });
  };

  useEffect(() => {
    setHasSubmitted(false);
    setIsConfirmationOpen(false);
    setIsFailedSubmissionConfirmation(false);
    setConfirmationMessage("Do you want to submit your answer?");
    setTestResults([]);
  }, [question?.questionId, question?.language]);

  useEffect(() => {
    if (!isTerminalResizing && !isCodeResizing) return;
    const onMouseMove = (event: MouseEvent) => {
      if (isTerminalResizing && terminalDragStartYRef.current !== null) {
        setTerminalHeight(
          Math.min(
            300,
            Math.max(
              100,
              startTerminalHeightRef.current +
                terminalDragStartYRef.current -
                event.clientY,
            ),
          ),
        );
      }
      if (isCodeResizing && codeDragStartXRef.current !== null) {
        const workspaceWidth = workspaceRef.current?.clientWidth ?? 0;
        if (workspaceWidth > 0) {
          setCodePanelWidth(
            Math.min(
              80,
              Math.max(
                20,
                startCodePanelWidthRef.current +
                  ((event.clientX - codeDragStartXRef.current) /
                    workspaceWidth) *
                    100,
              ),
            ),
          );
        }
      }
    };
    const onMouseUp = () => {
      terminalDragStartYRef.current = null;
      codeDragStartXRef.current = null;
      setIsTerminalResizing(false);
      setIsCodeResizing(false);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isCodeResizing, isTerminalResizing]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    setTestResults([]);
    if (question?.questionId) {
      const results = runQuestionTests(code, question);
      setTestResults(results);
      setOutput(
        results
          .map((result) =>
            result.executionError
              ? `${result.label}: Error\n  ${result.executionError}`
              : `${result.label}: ${result.passed ? "Passed" : "Failed"}\n  Result: ${result.actual}`,
          )
          .join("\n\n") || "No test results returned.",
      );
    } else {
      const result = runJavaScript(code);
      setOutput(
        result.stderr || result.stdout || "Code ran successfully with no output.",
      );
    }
    setIsRunning(false);
  };

  const submitCode = async (confirmSubmit = false) => {
    if (!question?.questionId) {
      setOutput("Generate a question first before submitting.");
      return;
    }

    setIsSubmitting(true);
    setOutput("Running test cases...");
    setTestResults([]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/question/${question.questionId}/submit`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language,
            confirmSubmit,
            testResults: runQuestionTests(code, question),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setOutput(data.message || "Failed to submit your solution.");
        return;
      }

      const results: TestResult[] = (data.results ?? []).slice(0, 2).map(
        (result: Partial<TestResult>) => ({
          label: result.label ?? "Test",
          passed: Boolean(result.passed),
          hidden: Boolean(result.hidden),
          args: result.args ?? [],
          expected: result.expected ?? "",
          actual: result.actual ?? "",
          executionError: result.executionError,
        }),
      );

      setTestResults(results);
      const passedCount = results.filter((r) => r.passed).length;
      const executionErrors = results.filter((r) => r.executionError);

      if (data.requiresConfirmation) {
        setConfirmationMessage(
          "You have not solved all test cases. Do you want to submit your answer anyway?",
        );
        setIsFailedSubmissionConfirmation(true);
        setIsSubmitting(false);
        setIsConfirmationOpen(true);
        return;
      }

      // Build a detailed per-test breakdown so candidates can see
      // expected vs actual output, not just a pass/fail count.
      const detailedOutput = results
        .map((result) => {
          const lines = [`${result.label}: ${result.passed ? "Passed" : "Failed"}`];
          if (result.executionError) {
            lines.push(`  Error: ${result.executionError}`);
          } else if (!result.hidden) {
            lines.push(`  Expected: ${result.expected}`);
            lines.push(`  Got: ${result.actual}`);
          } else {
            lines.push(`  (hidden test — details withheld)`);
          }
          return lines.join("\n");
        })
        .join("\n\n");

      setOutput(
        executionErrors.length > 0
          ? `Your code could not run for ${executionErrors.map((result) => result.label).join(", ")}. ${executionErrors[0].executionError}`
          : `${detailedOutput}\n\n${
              data.saved
                ? "All test cases passed. Your answer was saved to this meeting."
                : `${passedCount}/2 test cases passed. Your answer was saved to this meeting.`
            }`,
      );
      setHasSubmitted(true);
      setIsConfirmationOpen(false);
      // Saving now happens entirely on the backend inside /question/:id/submit —
      // no separate client-side save call needed here.
    } catch (error) {
      setOutput(
        error instanceof Error
          ? `Failed to submit test results: ${error.message}`
          : "Failed to submit test results.",
      );
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startTerminalResize = (event: React.MouseEvent<HTMLDivElement>) => {
    terminalDragStartYRef.current = event.clientY;
    startTerminalHeightRef.current = terminalHeight;
    setIsTerminalResizing(true);
  };
  const startCodeResize = (event: React.MouseEvent<HTMLDivElement>) => {
    codeDragStartXRef.current = event.clientX;
    startCodePanelWidthRef.current = codePanelWidth;
    setIsCodeResizing(true);
  };

  return (
    <>
      <div
        className="w-full overflow-hidden rounded-b-2xl border border-white/10"
        style={{
          height: isFullscreen
            ? "calc(100% - 140px - 52px)"
            : "calc(100% - 220px - 52px)",
          minHeight: isFullscreen ? "420px" : "260px",
          transition: "height 0.2s ease",
        }}
      >
        <div ref={workspaceRef} className="relative flex h-full min-h-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close code editor"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#141b25]/90 text-lg text-white transition hover:bg-[#1d2633]"
          >
            ×
          </button>
          <div
            className="flex h-full min-w-0 flex-col border-r border-white/10 bg-[#0f1117]"
            style={{ width: `${codePanelWidth}%` }}
          >
            <div
              role="separator"
              aria-label="Resize code and question panes"
              className="absolute left-0 top-0 h-full w-2 -translate-x-1/2 cursor-col-resize bg-[#d7d7dc] hover:bg-[#5146e5]"
              onMouseDown={startCodeResize}
            />
            <div className="min-h-0 flex-1">
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={onCodeChange}
                theme="vs-dark"
                options={{ fontSize: 14, minimap: { enabled: false } }}
              />
            </div>
            <div
              role="separator"
              aria-label="Resize editor and terminal panes"
              className="h-2 shrink-0 cursor-row-resize bg-[#1b1f2a] hover:bg-[#5146e5]"
              onMouseDown={startTerminalResize}
            />

            <div
              className="shrink-0 overflow-y-auto border-t border-white/10 bg-[#0d0e14] p-4 font-mono text-[13px] text-[#d7d7dc]"
              style={{ height: `${terminalHeight}px` }}
            >
              <div className="mb-2 text-[11px] uppercase tracking-wide text-[#6b6f80]">
                Terminal
              </div>
              {isRunning || isSubmitting ? (
                <p className="text-[#8b8f9d]">
                  {isSubmitting ? "Running test cases..." : "Running..."}
                </p>
              ) : (
                <pre className="whitespace-pre-wrap">{output}</pre>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-white/10 px-3 py-3">
              <div className="relative">
                <button
                  onClick={() => setIsQuestionPopupOpen((open) => !open)}
                  className="rounded-lg bg-[#282832] px-4 py-2 text-sm text-white transition hover:bg-[#33333f]"
                >
                  Questions
                </button>

                {isQuestionPopupOpen && (
                  <div className="absolute bottom-12 right-0 z-20 max-h-80 w-72 overflow-y-auto rounded-xl border border-white/10 bg-[#15151d] p-4 shadow-2xl">
                    {!question ? (
                      <p className="text-xs text-[#8b8f9d]">
                        {isHost
                          ? "No question generated yet."
                          : "Waiting for the host to generate a question."}
                      </p>
                    ) : (
                      <ol className="list-decimal space-y-2 pl-4 text-sm text-[#d7d7dc]">
                        <li>{question.title}</li>
                      </ol>
                    )}
                  </div>
                )}
              </div>
              <span className="rounded-lg bg-[#282832] px-3 py-2 text-sm text-white">
                JavaScript
              </span>
              <button
                onClick={runCode}
                disabled={isRunning || isSubmitting}
                className="rounded-lg bg-[#282832] px-4 py-2 text-sm text-white transition hover:bg-[#33333f] disabled:opacity-50"
              >
                {isRunning ? "Running..." : "Run"}
              </button>
              <button
                onClick={() => {
                  setConfirmationMessage("Do you want to submit your answer?");
                  setIsFailedSubmissionConfirmation(false);
                  setIsConfirmationOpen(true);
                }}
                disabled={isRunning || isSubmitting || !question || hasSubmitted}
                className="rounded-lg bg-[#5146e5] px-4 py-2 text-sm text-white transition hover:bg-[#4338d9] disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : hasSubmitted ? "Submitted" : "Submit"}
              </button>
            </div>
          </div>
          <div
            className="relative h-full min-w-0"
            style={{ width: `${100 - codePanelWidth}%` }}
            aria-label="Question workspace"
          >
            <div
              role="separator"
              aria-label="Resize code and question panes"
              className="absolute left-0 top-0 h-full w-2 -translate-x-1/2 cursor-col-resize bg-[#d7d7dc] hover:bg-[#5146e5]"
              onMouseDown={startCodeResize}
            />
            <QuestionPanel
              question={question}
              testResults={testResults}
              onQuestionGenerated={handleQuestionGenerated}
              meetingCode={meetingCode}
              isHost={isHost}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end border-t border-white/10 px-4 py-2">
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#1b1f2a] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#252b38]"
        >
          {isFullscreen ? (
            <>
              <Minimize2 size={14} />
              Exit full view
            </>
          ) : (
            <>
              <Maximize2 size={14} />
              Full view
            </>
          )}
        </button>
      </div>
      {isConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-confirmation-title"
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#15151d] p-5 text-white shadow-2xl"
          >
            <h2 id="submit-confirmation-title" className="text-base font-semibold">
              Submit the answer?
            </h2>
            <p className="mt-2 text-sm text-[#b7b8c4]">
              {confirmationMessage}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmationOpen(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#d7d7dc] transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmationOpen(false);
                  void submitCode(isFailedSubmissionConfirmation);
                }}
                disabled={isSubmitting}
                className="rounded-lg bg-[#5146e5] px-4 py-2 text-sm text-white transition hover:bg-[#4338d9] disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit anyway"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}