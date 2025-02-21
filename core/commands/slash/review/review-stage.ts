import * as fs from "fs/promises";
import * as path from "path";

import { IDE, SlashCommand } from "../../../index.js";
import { renderChatMessage } from "../../../util/messageContent.js";

const MAX_EXPLORE_DEPTH = 4;

const DOCUMENTATIONS = [
  "contributing.md", 
  "readme.md", 
  "style_guide.md"
]

const LINT_CONFIG_FILE_NAMES = [
  ".eslintrc", 
  ".pylintrc", 
  ".rubocop.yml", 
  ".editorconfig", 
  "prettierrc",
];

function extractFilename(diff: string) {
  const diffLine = diff.split('\n')[0];  // Get first line
  const path = diffLine.split(' ')[2];   // Split by spaces and get 3rd element
  return path.substring(2);              // Remove "a/" prefix
}

const ReviewStageDifferenceCommand: SlashCommand = {
  name: "review:stage",
  description: "Review stage difference code and give feedback",
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
    - Only list a maximum of 3 issues. If more issues exist, list only the top 3 prioritized by severity (High, Medium, Low).
    - Each issue must include a detailed description with specific instructions such as file name, line number, variable names, and any other specific details.
    - Each issue must also include a "Severity" field (possible values: "High", "Medium", "Low").
    - Similarly, provide detailed recommendations that include specific instructions (file name, line number, variable names, etc.) along with a "Severity" field if applicable.
    - Include a disclaimer in your output stating: "Disclaimer: Only top 3 issues per category are shown, prioritized by severity. Additional issues may exist."

    The review must cover the following sections:

    1. **Naming Conventions**
      - Evaluate if variable, function, and class names are consistent, descriptive, and follow a standard naming pattern.
      - Provide detailed issues (with file name, line number, variable names, etc.) and recommendations.

    2. **Duplications**
      - Identify any duplicate code segments or functionality that could be refactored.
      - Provide detailed issues and recommendations.

    3. **Proper Comments for All Activities**
      - Check that every significant piece of code has clear, helpful comments.
      - Provide detailed issues and recommendations for each sub-section (AddFunctions and DeleteFunctions).

    4. **Memory Leaks**
      - Identify potential memory leaks such as unused arrays or improperly managed memory.
      - Provide detailed issues and recommendations.

    5. **PR Summary**  
      - Review commit messages and pull request summaries for clarity and completeness.
      - Provide detailed issues and recommendations.

    6. **HIPAA/GDPR Compliance**  
      - Evaluate the code for compliance with HIPAA and GDPR regulations.
      - Provide separate detailed findings and recommendations for HIPAA and GDPR compliance.

    7. **Logging**  
      - Review the logging practices throughout the code.
      - Ensure that logs are meaningful and balanced.
      - Provide detailed issues and recommendations.

    8. **Refactoring**  
      - Provide overall recommendations to improve code structure, readability, and maintainability.
      - Identify areas where refactoring would significantly improve the code.
      - Provide detailed issues and recommendations.

    Your output must strictly adhere to the JSON structure provided below, including all specified keys. Do not output any text besides the JSON in a single code block.

    **Output JSON Structure:**

    \`\`\`
    {
      "Disclaimer": "Only top 3 issues per category are shown, prioritized by severity. Additional issues may exist.",
      "NamingConventions": {
        "Issues": [
          {
            "Description": "Detailed description including file name, line number, variable/function/class names, etc.",
            "File": "File name where the issue was found",
            "Line": "Line number(s) where the issue was detected",
            "Severity": "High/Medium/Low"
          }
          // Up to 3 issues
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
      },
      "Duplications": {
        "Issues": [
          {
            "Description": "Detailed description including file name, line number, etc.",
            "File": "File name where the duplication was found",
            "Line": "Line number(s) where the duplication occurs",
            "Severity": "High/Medium/Low"
          }
        ],
        "Recommendations": [
          {
            "Description": "Detailed recommendation with specific instructions to refactor duplicate code.",
            "File": "Relevant file name",
            "Line": "Line number(s) if applicable",
            "Severity": "High/Medium/Low"
          }
        ]
      },
      "ProperComments": {
        "Issues": [
          {
            "Description": "Detailed description of missing or inadequate comments in add functions (include file, line, etc.).",
            "File": "File name",
            "Line": "Line number(s)",
            "Severity": "High/Medium/Low"
          }
        ],
        "Recommendations": [
          {
            "Description": "Detailed recommendation to improve comments in add functions with specific instructions.",
            "File": "Relevant file name",
            "Line": "Line number(s)",
            "Severity": "High/Medium/Low"
          }
        ]
      },
      "MemoryLeaks": {
        "Issues": [
          {
            "Description": "Detailed description of potential memory leaks including file, line number, and affected variable/array names.",
            "File": "File name",
            "Line": "Line number(s)",
            "Severity": "High/Medium/Low"
          }
        ],
        "Recommendations": [
          {
            "Description": "Detailed recommendation to resolve the memory leak with specific instructions.",
            "File": "Relevant file name",
            "Line": "Line number(s)",
            "Severity": "High/Medium/Low"
          }
        ]
      },
      "PRSummary": {
        "Issues": [
          {
            "Description": "Detailed description of issues found in commit messages or PR summaries (include file or PR ID if applicable).",
            "File": "N/A or relevant file/PR identifier",
            "Line": "N/A",
            "Severity": "High/Medium/Low"
          }
        ],
        "Recommendations": [
          {
            "Description": "Detailed recommendation to improve commit messages or PR summaries with specific instructions.",
            "File": "N/A or relevant file/PR identifier",
            "Line": "N/A",
            "Severity": "High/Medium/Low"
          }
        ]
      },
      "Compliance": {
        "HIPAA": {
          "Issues": [
            {
              "Description": "Detailed description of HIPAA compliance issues with specific references (file name, line number, etc.).",
              "File": "File name",
              "Line": "Line number(s)",
              "Severity": "High/Medium/Low"
            }
          ],
          "Recommendations": [
            {
              "Description": "Detailed recommendation to address HIPAA compliance issues with specific instructions.",
              "File": "Relevant file name",
              "Line": "Line number(s)",
              "Severity": "High/Medium/Low"
            }
          ]
        },
        "GDPR": {
          "Issues": [
            {
              "Description": "Detailed description of GDPR compliance issues with specific references (file name, line number, etc.).",
              "File": "File name",
              "Line": "Line number(s)",
              "Severity": "High/Medium/Low"
            }
          ],
          "Recommendations": [
            {
              "Description": "Detailed recommendation to address GDPR compliance issues with specific instructions.",
              "File": "Relevant file name",
              "Line": "Line number(s)",
              "Severity": "High/Medium/Low"
            }
          ]
        }
      },
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
      },
      "Refactoring": {
        "Issues": [
          {
            "Description": "Detailed description of code areas that need refactoring including file name and line number.",
            "File": "File name",
            "Line": "Line number(s)",
            "Severity": "High/Medium/Low"
          }
        ],
        "Recommendations": [
          {
            "Description": "Detailed recommendation for refactoring with specific instructions and references to file and line number.",
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

async function gatherProjectStyleGuideContext(
  workspaceDir: string
): Promise<string> {
  let context = "";

  async function exploreDirectory(dir: string, currentDepth: number = 0) {
    if (currentDepth > MAX_EXPLORE_DEPTH) {
      return;
    }

    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(workspaceDir, fullPath);

        if (DOCUMENTATIONS.includes(entry.name)) {
          const content = await fs.readFile(fullPath, "utf-8");
          context += `${entry.name} for ${relativePath}:\n${content}\n\n`;
        }

        if (LINT_CONFIG_FILE_NAMES.includes(entry.name)) {
          const content = await fs.readFile(fullPath, "utf-8");
          context += `${entry.name} for ${relativePath}:\n${content}\n\n`;
        }
    }
  }

  await exploreDirectory(workspaceDir);

  return context;
}

export default ReviewStageDifferenceCommand;
