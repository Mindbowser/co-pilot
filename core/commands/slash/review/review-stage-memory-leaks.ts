import { SlashCommand } from "../../../index.js";
import { renderChatMessage } from "../../../util/messageContent.js";

const ReviewStageDifferenceMemoryLeaksCommand: SlashCommand = {
  name: "review:stage:memory-leaks",
  description: "Review memory leaks in stage difference code and give feedback",
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
You are a specialized code review assistant focused on memory management. Analyze the provided git diff and identify potential memory leaks in the code changes. Your output must follow the exact JSON structure specified below, enclosed in a code block using triple backticks.

Note: The following code context is provided as a git diff in unified format. In this format:
- The header line starting with "diff --git" indicates the file paths (e.g., "a/file" and "b/file").
- The "index" line shows the commit hashes.
- The lines starting with "---" and "+++" indicate the original and updated files, respectively.
- Hunk headers beginning with "@@" provide line number information in the format "@@ -<start line>,<number of lines> +<start line>,<number of lines> @@".
- Lines prefixed with '-' indicate removals, '+' indicate additions, and lines without a prefix are context lines.

Focus on identifying the following types of memory leaks and management issues:

1. Unfreed resources: Allocated memory that is never freed (malloc/new without free/delete)
2. Resource handle leaks: Unclosed file handles, database connections, or network sockets
3. Circular references: Objects referencing each other causing garbage collection issues
4. Event listener leaks: Listeners or callbacks that are registered but never removed
5. Closure-related memory leaks: Variables captured in closures preventing garbage collection
6. Memory-intensive data structures: Large collections or arrays that grow without bounds
7. Cached data without eviction policies: Data that accumulates in memory without cleanup
8. Improper cleanup in component lifecycles: Resources not released during destruction/unmounting

For each identified issue:
- Provide a detailed description with specific code references
- Indicate the severity based on potential impact
- Include specific recommendations for fixing the issue
- Consider the language-specific memory management patterns (garbage collection, manual memory management, etc.)

Severity Guidelines:
- High: Definite memory leak that will grow over time or with user interactions
- Medium: Potential memory leak that may occur under certain conditions
- Low: Inefficient memory usage that could be improved but not likely to cause crashes

Your output must strictly adhere to the following JSON structure:

**Output JSON Structure:**

\`\`\`
{
  "MemoryLeaks": {
    "Issues": [
      {
        "Description": "Detailed description of the memory leak including the mechanism and impact",
        "File": "File name",
        "Line": "Line number(s)",
        "Code": "Relevant code snippet",
        "LeakType": "Type of memory leak (e.g., 'Unfreed Resource', 'Event Listener Leak')",
        "Severity": "High/Medium/Low",
        "LanguageSpecific": "Any language-specific concerns (e.g., JavaScript closure leaks, C++ smart pointer usage)"
      }
    ],
    "Recommendations": [
      {
        "Description": "Detailed recommendation to resolve the memory leak with specific instructions",
        "File": "Relevant file name",
        "Line": "Line number(s)",
        "ProposedFix": "Example code showing how to fix the issue",
        "RelatedIssue": "Index of the related issue in the Issues array",
        "Severity": "High/Medium/Low"
      }
    ],
    "Summary": {
      "TotalIssues": 0,
      "SeverityCounts": {
        "High": 0,
        "Medium": 0,
        "Low": 0
      },
      "MostAffectedFiles": [
        "file1.js",
        "file2.cpp"
      ],
      "CommonPatterns": "Description of any repeated memory management issues across the codebase",
      "GeneralRecommendation": "Overall recommendation for improving memory management practices"
    }
  }
}
\`\`\`

When analyzing the code, consider the programming language being used and apply appropriate memory management principles. For example:
- In C/C++: Look for proper pairing of malloc/free or new/delete, smart pointer usage, and RAII patterns
- In JavaScript/TypeScript: Check for event listener removal, DOM references, and closure variable retention
- In Python: Look for proper resource cleanup, context managers, and reference cycles
- In Java/C#: Check for proper disposal of IDisposable objects and closing of resources

Please generate the review following the above structure. Only produce the JSON review with your findings based on the code, enclosed within a code block using triple backticks.
  `;
}

export default ReviewStageDifferenceMemoryLeaksCommand;
