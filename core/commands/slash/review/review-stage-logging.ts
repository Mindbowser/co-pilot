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

    **Logging**  
      - Review the logging practices throughout the code.
      - Ensure that logs are meaningful and balanced.
      - Provide detailed issues and recommendations.

    Your output must strictly adhere to the JSON structure provided below, including all specified keys. Do not output any text besides the JSON in a single code block.

    **Output JSON Structure:**

    \`\`\`
    {
      "Logging": {
        "Issues": [
          {
            "Description": "Detailed description of logging issues including file name, line number, and specifics about verbosity or missing logs.",
            "File": "File name",
            "Line": "Line number(s)",
            "Severity": "High/Medium/Low"
          }
        ],
        "Recommendations": [
          {
            "Description": "Detailed recommendation to improve logging practices with specific instructions.",
            "File": "Relevant file name",
            "Line": "Line number(s)",
            "Severity": "High/Medium/Low"
          }
        ]
      }
    }
    \`\`\`

    Please generate the review following the above structure. Do not output the prompt text or any translations—only produce the JSON review with your findings based on the code, and ensure that your entire output is enclosed within a code block using triple backticks.

  `;
}

export default ReviewStageDifferenceLoggingCommand;
