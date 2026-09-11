// components/user/call-screen/TestCaseFloatingPanel.tsx
import { useEffect, useRef, useState } from "react";
import { GripHorizontal, X } from "lucide-react";

type TestResult = {
  label: string;
  passed: boolean;
  hidden: boolean;
  input: string;
  expected: string;
  actual: string;
};

type TestCaseFloatingPanelProps = {
  testCases: { args: string[]; expectedOutput: string; isHidden: boolean }[];
  results: TestResult[];
  selectedTestIndex: number;
  onClose: () => void;
};

export default function TestCaseFloatingPanel({
  testCases,
  results,
  selectedTestIndex,
  onClose,
}: TestCaseFloatingPanelProps) {
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isSlidingIn, setIsSlidingIn] = useState(true);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const positionStartRef = useRef(position);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => setIsSlidingIn(false));
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const startDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    positionStartRef.current = position;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      setPosition({
        x:
          positionStartRef.current.x +
          (moveEvent.clientX - dragStartRef.current.x),
        y:
          positionStartRef.current.y +
          (moveEvent.clientY - dragStartRef.current.y),
      });
    };
    const onMouseUp = () => {
      dragStartRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const visibleTestCases = testCases
    .map((testCase, index) => ({ index, testCase, result: results[index] }))
    .filter(({ testCase }) => !testCase.isHidden);
  const selectedTestCase =
    visibleTestCases.find(({ index }) => index === selectedTestIndex) ??
    visibleTestCases[0];

  return (
    <div
      className={`fixed z-40 w-80 rounded-xl border border-white/10 bg-[#15151d] shadow-2xl transition-all duration-300 ease-out ${
        isSlidingIn ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
      style={{ left: position.x, top: position.y }}
    >
      <div
        onMouseDown={startDrag}
        className="flex cursor-grab items-center justify-between rounded-t-xl border-b border-white/10 bg-[#1b1b26] px-3 py-2 active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 text-xs font-medium text-[#8b8f9d]">
          <GripHorizontal size={14} />
          Test Cases
        </div>
        <button onClick={onClose} className="text-[#8b8f9d] hover:text-white">
          <X size={14} />
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto p-3">
        {!selectedTestCase ? (
          <p className="text-xs text-[#6b6f80]">No test cases available.</p>
        ) : (
          <div
            className={`rounded-lg border p-2.5 text-xs ${
              selectedTestCase.result
                ? selectedTestCase.result.passed
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5"
                : "border-white/10 bg-[#141923]"
            }`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-medium text-[#d7d7dc]">
                Case {selectedTestCase.index + 1}
              </span>
              {selectedTestCase.result && (
                <span
                  className={
                    selectedTestCase.result.passed
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {selectedTestCase.result.passed ? "Passed" : "Failed"}
                </span>
              )}
            </div>
            <div className="text-[#8b8f9d]">
              Input:{" "}
              <span className="text-[#d7d7dc]">
                {selectedTestCase.testCase.args?.join(", ")}
              </span>
            </div>
            <div className="text-[#8b8f9d]">
              Expected:{" "}
              <span className="text-[#d7d7dc]">
                {selectedTestCase.testCase.expectedOutput}
              </span>
            </div>
            {selectedTestCase.result && !selectedTestCase.result.passed && (
              <div className="mt-1 text-red-300">
                Got:{" "}
                <span className="text-red-200">
                  {selectedTestCase.result.actual}
                </span>
              </div>
            )}
          </div>
        )}

        {results.some((r) => r.hidden) && (
          <p className="mt-3 text-[11px] text-[#6b6f80]">
            {results.filter((r) => r.hidden && r.passed).length}/
            {results.filter((r) => r.hidden).length} hidden tests passed
          </p>
        )}
      </div>
    </div>
  );
}
