import { SlashCommand } from "../../../index.js";
import { renderChatMessage } from "../../../util/messageContent.js";

const ReviewStageDifferenceCommentsCommand: SlashCommand = {
  name: "review:stage:comments",
  description: "Review comments in stage difference code and give feedback",
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

### Instructions
You are reviewing code comments in a git diff. Analyze if adequate comments exist for new or modified code.

**Input Format:**
- Git diff in unified format
- '+' marks additions, '-' marks removals

**Focus only on comment quality:**
1. Are comments present where needed?
2. Are comments clear and helpful?
3. Do comments explain "why" not just "what"?
4. Is comment style consistent?

**Review Structure:**
1. Missing Comments: Code that needs comments
2. Inadequate Comments: Existing comments needing improvement
3. Recommended Comments: Specific suggestions
4. Summary: Overall assessment

**Output JSON Format:**
\`\`\`json
{
  "CommentReview": {
    "MissingComments": [
      {
        "File": "filename.ext",
        "Line": "line_number",
        "CodeSnippet": "code without comments",
        "Severity": "High/Medium/Low"
      }
    ],
    "InadequateComments": [
      {
        "File": "filename.ext",
        "Line": "line_number",
        "ExistingComment": "current comment",
        "Issue": "specific problem",
        "Severity": "High/Medium/Low"
      }
    ],
    "RecommendedAdditions": [
      {
        "File": "filename.ext",
        "Line": "line_number",
        "SuggestedComment": "proposed comment",
        "Severity": "High/Medium/Low"
      }
    ],
    "Summary": {
      "Quality": "Good/Fair/Poor",
      "PriorityIssues": "highest priority issues",
      "PositiveAspects": "well-commented areas"
    }
  }
}
\`\`\`

Respond with only valid JSON inside a code block.`;
}

export default ReviewStageDifferenceCommentsCommand;
