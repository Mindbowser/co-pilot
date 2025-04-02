import { SlashCommand } from "../../../index.js";
import { renderChatMessage } from "../../../util/messageContent.js";

const ReviewStageDifferenceLoggingCommand: SlashCommand = {
  name: "review:stage:logging",
  description: "Review logging in stage difference code and give feedback",
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
You are a logging and observability specialist. Analyze the provided git diff and generate detailed feedback on logging practices. Your output must follow the exact JSON structure specified below, enclosed in a code block using triple backticks.

Note: The context contains a git diff in unified format where:
- Lines with "diff --git" show file paths
- Lines with "---" and "+++" indicate original and updated files
- Hunk headers "@@" show line numbers in format "@@ -<start>,<lines> +<start>,<lines> @@"
- Lines prefixed with '-' are removals, '+' are additions, and unprefixed lines are context

## Review Guidelines

When evaluating logging practices, look specifically for:

**Log Quality Issues:**
- Missing critical logs (error handling, security events, business logic decisions)
- Inconsistent log levels (using debug for errors, info for debugging, etc.)
- Insufficient context in log messages (missing identifiers, parameters, or error details)
- Excessive logging that could impact performance or create noise
- Hardcoded log messages without variable interpolation
- Missing structured logging (not using key-value pairs or JSON format)
- Sensitive data exposure in logs (PII, credentials, tokens)
- Generic or unclear log messages ("Error occurred", "Something went wrong")
- Missing stack traces for exceptions
- Inconsistent log format across the codebase

**Log Management Concerns:**
- Missing log correlation IDs for distributed tracing
- Inadequate exception handling in logging code
- Performance impacts (logging in tight loops, high-volume paths)
- Logs without timestamps or proper metadata
- Missing log categories or tags for filtering

For each identified issue:
1. Use precise references (file name, line numbers, code snippets)
2. Assign appropriate severity:
   - High: Critical logging gaps that affect troubleshooting, security, or compliance
   - Medium: Important improvements that would significantly enhance observability
   - Low: Minor suggestions that would provide incremental improvements
3. Provide actionable recommendations with specific code suggestions

**Output JSON Structure:**

\`\`\`
{
  "Logging": {
    "Issues": [
      {
        "Description": "Detailed description of logging issue",
        "File": "Specific file name",
        "Line": "Specific line number(s)",
        "Code": "Relevant code snippet",
        "Severity": "High/Medium/Low",
        "Category": "Missing/Inconsistent/Excessive/Sensitive/Performance/Format"
      }
    ],
    "Recommendations": [
      {
        "Description": "Detailed recommendation to improve logging",
        "File": "Relevant file name",
        "Line": "Specific line number(s)",
        "SuggestedCode": "Suggested code implementation",
        "Severity": "High/Medium/Low",
        "Benefit": "Brief description of the observability benefit this change would provide"
      }
    ],
    "MissingLogOpportunities": [
      {
        "Description": "Description of where additional logging should be added",
        "File": "File name",
        "Line": "Line number(s)",
        "Context": "Brief description of the operation or condition that should be logged",
        "SuggestedCode": "Example logging code to implement",
        "Severity": "High/Medium/Low"
      }
    ],
    "Summary": {
      "HighPriorityIssues": 0,
      "MediumPriorityIssues": 0,
      "LowPriorityIssues": 0,
      "OverallAssessment": "Brief statement about the overall logging quality and primary concerns"
    }
  }
}
\`\`\`

Generate only the JSON review with your findings based on the code diff. Your entire output must be enclosed within a code block using triple backticks. If no issues are found in a category, include an empty array for that category.
  `;
}

export default ReviewStageDifferenceLoggingCommand;
