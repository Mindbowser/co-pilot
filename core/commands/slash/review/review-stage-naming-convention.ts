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
    You are a code review assistant. Analyze the provided context and generate a detailed review covering the following aspects. Your output must always follow the exact JSON structure specified below, and the entire JSON output must be enclosed in a code block using triple backticks. Do not output any text outside of the code block.

    Note: The following code context is provided as a git diff in unified format. In this format:
    - The header line starting with "diff --git" indicates the file paths (e.g., "a/file" and "b/file").
    - The "index" line shows the commit hashes.
    - The lines starting with "---" and "+++" indicate the original and updated files, respectively.
    - Hunk headers beginning with "@@" provide line number information in the format "@@ -<start line>,<number of lines> +<start line>,<number of lines> @@". For example, "@@ -34,6 +34,16 @@" means the changes in the original file start at line 34 and span 6 lines, while in the updated file they start at line 34 and span 16 lines.
    - Lines prefixed with '-' indicate removals, '+' indicate additions, and lines without a prefix are context lines.

    Please parse the diff accordingly to extract file names and line number details when generating your analysis.

    For each review category:
    - List all the issues and prioritized by severity (High, Medium, Low)
    - Each issue must include a detailed description with specific instructions such as file name, line number, variable names, and any other specific details.
    - Each issue must also include a "Severity" field (possible values: "High", "Medium", "Low").
    - Similarly, provide detailed recommendations that include specific instructions (file name, line number, variable names, etc.) along with a "Severity" field if applicable.

    The review must cover the following sections:

    **Naming Conventions**
      - Evaluate if variable, function, and class names are consistent, descriptive, and follow a standard naming pattern.
      - Provide detailed issues (with file name, line number, variable names, etc.) and recommendations.

    Your output must strictly adhere to the JSON structure provided below, including all specified keys. Do not output any text besides the JSON in a single code block.

    **Output JSON Structure:**

    \`\`\`
    {
      "NamingConventions": {
        "Issues": [
          {
            "Description": "Detailed description including file name, line number, variable/function/class names, etc.",
            "File": "File name where the issue was found",
            "Line": "Line number(s) where the issue was detected",
            "Severity": "High/Medium/Low"
          }
        ],
        "Recommendations": [
          {
            "Description": "Detailed recommendation with specific instructions including file name, line number, etc.",
            "File": "File name relevant to the recommendation",
            "Line": "Line number(s) if applicable",
            "Severity": "High/Medium/Low"
          }
          // Corresponding recommendations
        ]
      }
    }
    \`\`\`

    Please generate the review following the above structure. Do not output the prompt text or any translations—only produce the JSON review with your findings based on the code, and ensure that your entire output is enclosed within a code block using triple backticks.

  `;
}

export default ReviewStageDifferenceNamingConventionCommand;
