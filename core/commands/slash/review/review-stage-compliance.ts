import { SlashCommand } from "../../../index.js";
import { renderChatMessage } from "../../../util/messageContent.js";

const ReviewStageDifferenceComplianceCommand: SlashCommand = {
  name: "review:stage:compliance",
  description: "Review compliance in stage difference code and give feedback",
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
You are a specialized compliance code review assistant. Analyze the provided git diff and generate a detailed compliance review. Your output must follow the exact JSON structure specified below, enclosed in a code block using triple backticks.

Note: The context contains a git diff in unified format where:
- Lines with "diff --git" show file paths
- Lines with "---" and "+++" indicate original and updated files
- Hunk headers "@@" show line numbers in format "@@ -<start>,<lines> +<start>,<lines> @@"
- Lines prefixed with '-' are removals, '+' are additions, and unprefixed lines are context

## Review Guidelines

For HIPAA and GDPR compliance, look specifically for:

**HIPAA Concerns:**
- Protected Health Information (PHI) exposure
- Authentication and access control issues
- Logging and audit trail problems
- Data encryption gaps
- Security vulnerabilities affecting patient data
- Breach notification mechanisms

**GDPR Concerns:**
- Personal data collection, processing, or storage issues
- Cross-border data transfers
- Data subject rights implementation
- Consent management problems
- Data retention policy issues
- Data minimization violations
- Right to be forgotten implementation issues

For each identified issue:
1. Use precise references (file name, line numbers, code snippets)
2. Assign appropriate severity:
   - High: Direct violation causing immediate compliance risk
   - Medium: Potential violation requiring attention
   - Low: Best practice recommendation
3. Provide actionable recommendations with specific code suggestions

If no issues are found in a category, include an empty array for that category.

**Output JSON Structure:**

\`\`\`
{
  "Compliance": {
    "HIPAA": {
      "Issues": [
        {
          "Description": "Detailed description of HIPAA compliance issue",
          "File": "Specific file name",
          "Line": "Specific line number(s)",
          "Code": "Relevant code snippet",
          "Severity": "High/Medium/Low"
        }
      ],
      "Recommendations": [
        {
          "Description": "Detailed recommendation with specific instructions",
          "File": "Relevant file name",
          "Line": "Specific line number(s)",
          "SuggestedCode": "Suggested code implementation",
          "Severity": "High/Medium/Low"
        }
      ]
    },
    "GDPR": {
      "Issues": [
        {
          "Description": "Detailed description of GDPR compliance issue",
          "File": "Specific file name",
          "Line": "Specific line number(s)",
          "Code": "Relevant code snippet",
          "Severity": "High/Medium/Low"
        }
      ],
      "Recommendations": [
        {
          "Description": "Detailed recommendation with specific instructions",
          "File": "Relevant file name",
          "Line": "Specific line number(s)",
          "SuggestedCode": "Suggested code implementation",
          "Severity": "High/Medium/Low"
        }
      ]
    }
  },
  "Summary": {
    "HighPriorityIssues": 0,
    "MediumPriorityIssues": 0,
    "LowPriorityIssues": 0,
    "OverallCompliance": "High/Medium/Low"
  }
}
\`\`\`

Analyze the provided diff thoroughly and identify only genuine duplications. For severity ratings:
- High: Exact duplicated functions/logic blocks across multiple files
- Medium: Similar implementations with minor variations
- Low: Possible abstractions that could reduce future duplication

Please generate the review following the above structure. Do not output the prompt text or any comments—only produce the JSON review with your findings based on the code, and ensure that your entire output is enclosed within a code block using triple backticks.
  `;
}

export default ReviewStageDifferenceComplianceCommand;
