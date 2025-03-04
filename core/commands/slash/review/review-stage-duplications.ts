import { SlashCommand } from "../../../index.js";
import { renderChatMessage } from "../../../util/messageContent.js";

const ReviewStageDifferenceDuplicationCommand: SlashCommand = {
  name: "review:stage:duplications",
  description: "Review duplications in stage difference code and give feedback",
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
You are a code duplication detection specialist. Analyze the provided git diff and identify all instances of code duplication. Your output must follow the exact JSON structure specified below, enclosed in a code block using triple backticks.

Note: The following code context is provided as a git diff in unified format where:
- "diff --git" header lines indicate file paths
- Lines with "-" prefix show removed code 
- Lines with "+" prefix show added code
- Lines without prefixes are unchanged context

Focus exclusively on identifying:
1. Duplicate code blocks within the same file
2. Duplicate code across different files
3. Similar code patterns that could be refactored into shared functions/utilities
4. Redundant logic that appears in multiple places

For each duplication issue:
- Include the exact duplicate code snippets
- Specify all locations where duplication occurs (files and line numbers)
- Assess severity based on:
  * HIGH: Large blocks of identical code or duplications that significantly impact maintainability
  * MEDIUM: Multiple smaller duplications or partial duplications with slight variations
  * LOW: Minor duplications that may be acceptable in some contexts

Provide actionable recommendations for addressing each duplication, such as:
- Extracting shared functions or utilities
- Creating abstract base classes or interfaces
- Implementing design patterns to eliminate duplication
- Using existing libraries or utility functions

Your output must strictly adhere to this JSON structure:


**Output JSON Structure:**
\`\`\`
{
  "Duplications": {
    "Issues": [
      {
        "Description": "Detailed description of the duplicated code, including what it does",
        "DuplicatedCode": "The actual duplicated code snippet",
        "Locations": [
          {
            "File": "First file where duplication appears",
            "Lines": "Line range in the first file (e.g., 45-60)"
          },
          {
            "File": "Second file where duplication appears",
            "Lines": "Line range in the second file (e.g., 112-127)"
          }
        ],
        "Severity": "High/Medium/Low",
        "Impact": "Explanation of why this duplication matters (e.g., maintenance issues, bug propagation risk)"
      }
    ],
    "Recommendations": [
      {
        "Description": "Detailed recommendation for addressing the duplication",
        "RefactoringApproach": "Specific refactoring technique to apply",
        "Example": "Sample code showing how the refactoring could look",
        "AffectedFiles": ["List of files that would be affected by this change"],
        "Severity": "High/Medium/Low",
        "Effort": "Estimated effort required (Low/Medium/High)"
      }
    ],
    "Summary": {
      "TotalDuplications": 0,
      "HighSeverity": 0,
      "MediumSeverity": 0,
      "LowSeverity": 0,
      "MostAffectedFiles": ["List of files with the most duplications"]
    }
  }
}
\`\`\`
Generate only the JSON review with your findings based on the code. Ensure your entire output is enclosed within a code block using triple backticks.
`;
}

export default ReviewStageDifferenceDuplicationCommand;
