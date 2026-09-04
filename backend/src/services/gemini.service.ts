import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface QuestionGenerationInput {
  level: string;        // "Intern" | "Fresher" | "Junior" | "Intermediate" | "Senior"
  domain: string;        // "Frontend" | "Backend" | "Full Stack" | etc.
  language: string;      // "javascript" | "python" | etc.
  jobRole: string;        // free text, e.g. "React Developer"
  description?: string;   // optional free text, host's extra context
}

interface GeneratedQuestion {
  title: string;
  description: string;
  starterCode: string;
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
}

export async function generateInterviewQuestion(
  input: QuestionGenerationInput
): Promise<GeneratedQuestion> {
  const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

  const prompt = `
You are generating a technical coding interview question.

Candidate level: ${input.level}
Domain: ${input.domain}
Programming language: ${input.language}
Job role: ${input.jobRole}
${input.description ? `Additional context from interviewer: ${input.description}` : ""}

Generate ONE coding question appropriate for this candidate's level and role.
Respond ONLY with valid JSON in exactly this shape, no extra text:

{
  "title": "short question title",
  "description": "full problem statement, clear and unambiguous, including input/output format",
  "starterCode": "minimal boilerplate function signature in ${input.language}, no implementation",
  "testCases": [
    { "input": "string representation of input", "expectedOutput": "string representation of correct output", "isHidden": false },
    { "input": "...", "expectedOutput": "...", "isHidden": false },
    { "input": "...", "expectedOutput": "...", "isHidden": true },
    { "input": "...", "expectedOutput": "...", "isHidden": true }
  ]
}

Provide at least 4 test cases: at least 2 visible (isHidden: false) and at least 2 hidden (isHidden: true) edge cases.
Ensure expectedOutput values are actually correct for the described logic — double check your own arithmetic/logic before responding.
`.trim();

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  try {
    return JSON.parse(responseText) as GeneratedQuestion;
  } catch (err) {
    throw new Error("AI returned invalid JSON: " + responseText);
  }
}