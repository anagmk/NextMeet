export function buildExecutableCode(
  candidateCode: string,
  functionName: string,
  args: string[],
  language: string
): string {
  const argsString = args.join(", ");

  switch (language.toLowerCase()) {
    case "javascript":
    case "typescript":
      return `
${candidateCode}

console.log(JSON.stringify(${functionName}(${argsString})));
`.trim();

    case "python":
      return `
${candidateCode}

import json
print(json.dumps(${functionName}(${argsString})))
`.trim();

    default:
      throw new Error(`Automatic test-case invocation not yet supported for ${language}`);
  }
}