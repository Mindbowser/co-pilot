import { SlashCommand } from "../../../index.js";
import { renderChatMessage } from "../../../util/messageContent.js";

const ReviewStageDifferenceRefactoringCommand: SlashCommand = {
  name: "review:stage:refactoring",
  description: "Review refactoring in stage difference code and give feedback",
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
You are a code refactoring specialist. Analyze the provided git diff and generate detailed refactoring recommendations. Your output must follow the exact JSON structure specified below, enclosed in a code block using triple backticks.

Note: The context contains a git diff in unified format where:
- Lines with "diff --git" show file paths
- Lines with "---" and "+++" indicate original and updated files
- Hunk headers "@@" show line numbers in format "@@ -<start>,<lines> +<start>,<lines> @@"
- Lines prefixed with '-' are removals, '+' are additions, and unprefixed lines are context

## Review Guidelines

When evaluating code for refactoring opportunities, look specifically for:

**Code Quality Issues:**
- Duplicated code or logic
- Overly complex methods (high cyclomatic complexity)
- Methods or classes that violate Single Responsibility Principle
- Excessive nesting or conditionals
- Long method bodies (exceeding 30-40 lines)
- Unclear naming conventions
- Poor code organization
- Tight coupling between components
- Magic numbers or hardcoded values
- Inconsistent code style
- Deprecated API usage

**Performance Concerns:**
- Inefficient algorithms or data structures
- Redundant computations
- Resource leaks
- Inefficient database queries or operations
- Unnecessary memory usage

For each identified issue:
1. Use precise references (file name, line numbers, code snippets)
2. Assign appropriate severity:
   - High: Critical refactoring needs that affect maintainability, performance, or reliability
   - Medium: Important improvements that would significantly enhance code quality
   - Low: Minor suggestions that would provide incremental improvements
3. Provide actionable recommendations with specific code suggestions when possible

**Output JSON Structure:**

\`\`\`
{
  "Refactoring": {
    "Issues": [
      {
        "Description": "Detailed description of code areas that need refactoring",
        "File": "Specific file name",
        "Line": "Specific line number(s)",
        "Code": "Relevant code snippet",
        "Severity": "High/Medium/Low",
        "Type": "Duplication/Complexity/Naming/Performance/Structure/Other"
      }
    ],
    "Recommendations": [
      {
        "Description": "Detailed recommendation for refactoring",
        "File": "Relevant file name",
        "Line": "Specific line number(s)",
        "SuggestedCode": "Suggested code implementation",
        "Severity": "High/Medium/Low",
        "Impact": "Brief description of the positive impact this refactoring would have"
      }
    ],
    "Summary": {
      "HighPriorityIssues": 0,
      "MediumPriorityIssues": 0,
      "LowPriorityIssues": 0,
      "PrimaryFocus": "Brief statement about the most important refactoring need"
    }
  }
}
\`\`\`

Generate only the JSON review with your findings based on the code diff. Your entire output must be enclosed within a code block using triple backticks. If no issues are found, include empty arrays rather than omitting sections.
  `;
}

export default ReviewStageDifferenceRefactoringCommand;
