import { getPistonLanguage } from "../utils/languageMap.js";

const PISTON_URL = `${process.env.PISTON_URL}/api/v2/execute`;

interface PistonResult {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    output: string;
  };
  language: string;
  version: string;
}

export async function judgeCode(
  code: string,
  language: string,
  input?: string
): Promise<PistonResult> {
  const { language: pistonLang, version } = getPistonLanguage(language);

  const response = await fetch(PISTON_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: pistonLang,
      version,
      files: [{ content: code }],
      stdin: input ?? "",
    }),
  });

  if (!response.ok) {
    throw new Error(`Piston request failed: ${response.status}`);
  }

  const data = (await response.json()) as PistonResult;
  return data;
}