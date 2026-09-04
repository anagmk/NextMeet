const LANGUAGE_VERSIONS: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "*" },
  python: { language: "python", version: "*" },
  java: { language: "java", version: "*" },
  cpp: { language: "cpp", version: "*" },
  c: { language: "c", version: "*" },
  typescript: { language: "typescript", version: "*" },
  go: { language: "go", version: "*" },
};

export function getPistonLanguage(language: string) {
  const config = LANGUAGE_VERSIONS[language.toLowerCase()];
  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }
  return config;
}