import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface QuestionGenerationInput {
  level: string;
  domain: string;
  language: string;
  jobRole: string;
  description?: string;
}

interface GeneratedQuestion {
  title: string;
  description: string;
  starterCode: string;
  functionName: string;
  testCases: { args: string[]; expectedOutput: string; isHidden: boolean }[];
}

async function callGeminiWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 1500
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const isRetryable =
      err instanceof Error && err.message.includes("503");
    if (isRetryable && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return callGeminiWithRetry(fn, retries - 1, delayMs * 2);
    }
    throw err;
  }
}

export async function generateInterviewQuestion(
  input: QuestionGenerationInput
): Promise<GeneratedQuestion> {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `
You are generating a technical coding interview question.

Candidate level: ${input.level}
Domain: ${input.domain}
Programming language: ${input.language}
Job role: ${input.jobRole}
${input.description ? `Additional context from interviewer: ${input.description}` : ""}

The candidate will implement a single function named exactly "solve".

Generate ONE coding question appropriate for this candidate's level and role.
Respond ONLY with valid JSON in exactly this shape, no extra text:

{
  "title": "short question title",
  "description": "full problem statement, clear and unambiguous, describing solve()'s parameters and return value",
  "starterCode": "function solve(...) {\\n  // your code here\\n}",
  "functionName": "solve",
  "testCases": [
    { "args": ["valid ${input.language} expression for argument 1", "argument 2 if any"], "expectedOutput": "exact string form of the correct return value", "isHidden": false }
  ]
}

Rules:
- "args" is an array of strings, each a valid ${input.language} literal expression (e.g. "[1,2,3]", "5", "\\"hello\\"") representing one positional argument to solve().
- "expectedOutput" must be the exact JSON-stringified form of what solve(...args) should return (e.g. an array returns as "[1,2,3]", a number as "6", a string as "\\"hello\\"").
- Provide at least 4 test cases: at least 2 visible (isHidden: false) and at least 2 hidden (isHidden: true) edge cases.
- Double-check your own arithmetic/logic so expectedOutput is actually correct before responding.
`.trim();

  const result = await callGeminiWithRetry(() => model.generateContent(prompt));
  const responseText = result.response.text();

  try {
    return JSON.parse(responseText) as GeneratedQuestion;
  } catch (err) {
    throw new Error("AI returned invalid JSON: " + responseText);
  }
}