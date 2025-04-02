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

const ReviewMessageCommand: SlashCommand = {
  name: "review",
  description: "Review code and give feedback",
  run: async function* ({ llm, ide, params }) {
    const includeUnstaged = params?.includeUnstaged ?? false;
    const diff = await ide.getDiff(includeUnstaged);

    if (diff.length === 0) {
      yield "No changes detected. Make sure you are in a git repository with current changes.";
      return;
    }

    const [workspaceDir] = await ide.getWorkspaceDirs();

    const styleGuideContext = await gatherProjectStyleGuideContext(workspaceDir);

    const diffFiles = diff.map(d => extractFilename(d));

    const context = `${diff.join("\n")}`;
    const prompt = createReviewPrompt(context, styleGuideContext);

    for await (const chunk of llm.streamChat(
      [{ role: "user", content: prompt }],
      new AbortController().signal,
    )) {
      yield renderChatMessage(chunk);
    }
  },
};

function createReviewPrompt(diffContent: string, styleGuideContent: string): string {
  return `
    You are an expert code reviewer and style guide enforcer. Your task is to **strictly and consistently** analyze the staged changes in the Git diff against the official and custom style guides.  

    ### Instructions:
    1. **Identify the programming language** based on the file extensions in the Git diff. Use **only** file extensions for identification.
    2. **Refer to BOTH**:
      - The **official style guide** for the language (e.g., PEP 8 for Python).
      - The **custom style guide** provided below for this codebase.
    3. **Strictly enforce** the rules from both guides. **If conflicts arise, prioritize the custom style guide.**
    4. **Use a fixed step-by-step process** to ensure consistent results across multiple runs:
      - **Step 1:** Parse the Git diff and extract relevant code changes.
      - **Step 2:** Identify and categorize violations into:
        - **Indentation & Spacing Issues**
        - **Naming Conventions**
        - **Commenting Issues**
        - **Line Length Violations**
        - **Custom Rule Violations**
      - **Step 3:** Format the report in a structured and deterministic manner (see below).
    5. **Do not introduce subjective analysis.** Base all findings strictly on documented rules.
    6. **Ensure deterministic output.** For identical inputs, the output should remain unchanged.

    ------------------------------------------------------------------------------------

    
    ${styleGuideContent ? `
    ### Custom Style Guide for This Codebase
    ${styleGuideContent}
    ` : ''}

    ------------------------------------------------------------------------------------

    ### Git Diff to Analyze
    ${diffContent}

    ------------------------------------------------------------------------------------

    ### Response Format:  

    - **Language Identified:** "[Language]"  
    - **Official Style Guide:** "[Name/Link]"  
    - **Custom Style Guide Adherence:** "[Yes/No]"  
    - **Violations:**  
      - "[Line X]: [Type of Issue] - [Description + Suggested Fix]"  
      - "[Line Y]: [Type of Issue] - [Description + Suggested Fix]"  
    - **Summary:**  
      - "[Overall compliance status]"  
      - "[Key takeaways & action items]"  

    ------------------------------------------------------------------------------------

    ### Additional Rules for Consistency:  
    - **Always follow the exact structure above.**  
    - **Do not introduce variability** in wording or formatting.  
    - **Use precise technical language** from the style guides.  
    - **Group violations by type** to maintain readability.  

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

export default ReviewMessageCommand;
