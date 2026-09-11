export function getStarterCode(language: string, functionName: string, paramNames: string[]): string {
  const params = paramNames.join(", ");

  switch (language.toLowerCase()) {
    case "javascript":
    case "typescript":
      return `function ${functionName}(${params}) {\n  // your code here\n}`;

    case "python":
      return `def ${functionName}(${params}):\n    # your code here\n    pass`;

    case "java":
      return `class Solution {\n    public static Object ${functionName}(${params}) {\n        // your code here\n        return null;\n    }\n}`;

    case "cpp":
      return `#include <bits/stdc++.h>\nusing namespace std;\n\nauto ${functionName}(${params}) {\n    // your code here\n}`;

    case "c":
      return `#include <stdio.h>\n\nvoid ${functionName}(${params}) {\n    // your code here\n}`;

    case "go":
      return `func ${functionName}(${params}) interface{} {\n    // your code here\n    return nil\n}`;

    default:
      return `// starter code not available for ${language}`;
  }
}