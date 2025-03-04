import { SlashCommand } from "../../../index.js";
import { renderChatMessage } from "../../../util/messageContent.js";

const ReviewStageDifferenceNamingConventionCommand: SlashCommand = {
  name: "review:stage:naming-convention",
  description: "Review naming convention in stage difference code and give feedback",
  run: async function* ({ llm, ide, params }) {
    const includeUnstaged = params?.includeUnstaged ?? false;
    const diff = await ide.getDiff(includeUnstaged);

    if (diff.length === 0) {
      yield "No changes detected. Make sure you are in a git repository with current changes.";
      return;
    }

    const context = `${diff.join("\n")}`;
    const prompt = createReviewPrompt(context);

    for await (const chunk of llm.streamChat(
      [{ role: "user", content: prompt }],
      new AbortController().signal,
    )) {
      yield renderChatMessage(chunk);
    }
  },
};

function createReviewPrompt(context: string): string {
  return `
### Context
${context}

### Question
You are a code review assistant specializing in naming conventions. Analyze the provided git diff to identify ONLY legitimate naming issues where the name can be meaningfully improved. Your output must follow the JSON structure specified below.

Note: The code context is provided as a git diff in unified format where:
- "diff --git" header lines indicate file paths 
- Lines with "-" prefix show removed code
- Lines with "+" prefix show added code
- Lines without prefixes are unchanged context

CRITICAL RULES TO FOLLOW:
1. NEVER output an issue unless you can suggest a GENUINELY BETTER alternative name.
2. CurrentName and SuggestedName MUST be different for every issue.
3. Do not flag standard abbreviations (sqrt, pow, min, max, etc.) as issues.
4. Do not flag standard loop counter variables (i, j, k) as issues.
5. Follow language-appropriate conventions:
   - JavaScript/TypeScript: camelCase for variables/functions, PascalCase for classes
   - Python: snake_case for variables/functions, PascalCase for classes
   - Java/C#/Kotlin: camelCase for variables/functions, PascalCase for classes
   - Do NOT recommend PascalCase for JavaScript functions

When evaluating names, look for:
1. Non-descriptive names (e.g., 'data', 'temp', 'obj') that could be more specific
2. Ambiguous names that don't clearly convey the variable's purpose
3. Inconsistent casing relative to the language convention
4. Names with unnecessary type information (e.g., 'userString', 'accountArray')
5. Misleading names that suggest different functionality than implemented

For each issue found:
- Show the exact problematic name (CurrentName)
- Suggest a specific, improved alternative (SuggestedName)
- Explain precisely how the suggested name is better than the current one
- Verify that SuggestedName follows appropriate conventions for the language

Your output must adhere to this JSON structure:

**Output JSON Structure:**

\`\`\`
{
  "NamingConventions": {
    "Issues": [
      {
        "Description": "Specific description of the naming issue",
        "File": "File where the issue was found",
        "Line": "Line number(s) where the issue was detected",
        "CurrentName": "The problematic name as it currently exists",
        "SuggestedName": "A better alternative name (MUST be different from CurrentName)",
        "Category": "Variable/Function/Class/Interface/Constant/File",
        "Convention": "Expected convention for this language and category",
        "Severity": "High/Medium/Low",
        "Rationale": "Detailed explanation of how the suggested name improves on the current one"
      }
    ],
    "Recommendations": [
      {
        "Description": "Recommendation for consistent naming patterns",
        "Files": [
          "List of affected files"
        ],
        "NamingPattern": "Pattern that should be consistently applied",
        "Examples": {
          "Before": [
            "Example of a current problematic name"
          ],
          "After": [
            "Example of the improved name (MUST be different from Before)"
          ]
        },
        "Severity": "High/Medium/Low",
        "ImplementationApproach": "Approach for implementing these changes"
      }
    ],
    "DetectedConventions": {
      "Variables": "Detected convention for variables in this codebase",
      "Functions": "Detected convention for functions in this codebase",
      "Classes": "Detected convention for classes in this codebase",
      "Constants": "Detected convention for constants in this codebase",
      "Files": "Detected convention for file names in this codebase"
    },
    "Summary": {
      "TotalIssues": 0,
      "HighSeverity": 0,
      "MediumSeverity": 0,
      "LowSeverity": 0,
      "MostCommonIssue": "Description of the most common naming issue found"
    }
  }
}
\`\`\`

IF NO NAMING ISSUES ARE FOUND:
If you cannot identify any genuine naming issues where you can suggest better alternatives, return the following structure:

\`\`\`
{
  "NamingConventions": {
    "Issues": [],
    "Recommendations": [],
    "DetectedConventions": {
      "Variables": "Appropriate conventions are being followed",
      "Functions": "Appropriate conventions are being followed",
      "Classes": "Appropriate conventions are being followed",
      "Constants": "Appropriate conventions are being followed",
      "Files": "Appropriate conventions are being followed"
    },
    "Summary": {
      "TotalIssues": 0,
      "HighSeverity": 0,
      "MediumSeverity": 0,
      "LowSeverity": 0,
      "MostCommonIssue": "No naming issues detected"
    }
  }
}
\`\`\`

FINAL CHECKS BEFORE SUBMISSION:
1. Verify that every CurrentName and SuggestedName pair contains different values
2. Confirm that all conventions recommended are appropriate for the language
3. Ensure Examples Before and After values are different
4. Make sure all suggested names follow their stated conventions

Generate only the JSON review with your findings. Ensure your output is enclosed within a code block using triple backticks.
`;
}

export default ReviewStageDifferenceNamingConventionCommand;
