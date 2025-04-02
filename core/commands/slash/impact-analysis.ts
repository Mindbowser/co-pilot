import { IDE, SlashCommand } from "../..";
import * as fs from "fs/promises";
import * as path from "path";
import ignore from "ignore";
import {
  defaultIgnoreDir,
  defaultIgnoreFile,
  gitIgArrayFromFile,
} from "../../indexing/ignore";
import { renderChatMessage } from "../../util/messageContent";

const LANGUAGE_DEP_MGMT_FILENAMES = [
  "package.json", // JavaScript (Node.js)
  "requirements.txt", // Python
  "Gemfile", // Ruby
  "pom.xml", // Java (Maven)
  "build.gradle", // Java (Gradle)
  "composer.json", // PHP
  "Cargo.toml", // Rust
  "go.mod", // Go
  "packages.config", // C# (.NET)
  "*.csproj", // C# (.NET Core)
  "pubspec.yaml", // Dart
  "Project.toml", // Julia
  "mix.exs", // Elixir
  "rebar.config", // Erlang
  "shard.yml", // Crystal
  "Package.swift", // Swift
  "dependencies.gradle", // Kotlin (when using Gradle)
  "Podfile", // Objective-C/Swift (CocoaPods)
  "*.cabal", // Haskell
  "dub.json", // D
];

const MAX_EXPLORE_DEPTH = 2;

const ImpactAnalysisSlashCommand: SlashCommand = {
  name: "impact-analysis",
  description: "Generate a real-time impact analysis report",
  run: async function* ({ llm, ide, params }) {
    const includeUnstaged = params?.includeUnstaged ?? false;
    const diff = await ide.getDiff(includeUnstaged);

    if (diff.length === 0) {
      yield "No changes detected. Make sure you are in a git repository with current changes.";
      return;
    }
    const context = `${diff.join("\n")}`;
    const prompt = createOnboardingPrompt(context);

    for await (const chunk of llm.streamChat(
      [{ role: "user", content: prompt }],
      new AbortController().signal,
    )) {
      yield renderChatMessage(chunk);
    }
  },
};

async function getEntriesFilteredByIgnore(dir: string, ide: IDE) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  let ig = ignore().add(defaultIgnoreDir).add(defaultIgnoreFile);

  const gitIgnorePath = path.join(dir, ".gitignore");

  const hasIgnoreFile = await fs
    .access(gitIgnorePath)
    .then(() => true)
    .catch(() => false);

  if (hasIgnoreFile) {
    const gitIgnore = await ide.readFile(gitIgnorePath);
    const igPatterns = gitIgArrayFromFile(gitIgnore);

    ig = ig.add(igPatterns);
  }

  const filteredEntries = entries.filter((entry) => !ig.ignores(entry.name));

  return filteredEntries;
}

async function gatherProjectContext(
  workspaceDir: string,
  ide: IDE,
): Promise<string> {
  let context = "";

  async function exploreDirectory(dir: string, currentDepth: number = 0) {
    if (currentDepth > MAX_EXPLORE_DEPTH) {
      return;
    }

    const entries = await getEntriesFilteredByIgnore(dir, ide);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(workspaceDir, fullPath);

      if (entry.isDirectory()) {
        context += `\nFolder: ${relativePath}\n`;
        await exploreDirectory(fullPath, currentDepth + 1);
      } else {
        if (entry.name.toLowerCase() === "readme.md") {
          const content = await fs.readFile(fullPath, "utf-8");
          context += `README for ${relativePath}:\n${content}\n\n`;
        } else if (LANGUAGE_DEP_MGMT_FILENAMES.includes(entry.name)) {
          const content = await fs.readFile(fullPath, "utf-8");
          context += `${entry.name} for ${relativePath}:\n${content}\n\n`;
        }
      }
    }
  }

  await exploreDirectory(workspaceDir);

  return context;
}

function createOnboardingPrompt(context: string): string {
  return `
  I have staged some code changes in Git, and I need a detailed analysis of the impact these changes will make. Please analyze the changes for:

  1. Code Quality & Standards: Are the changes following best practices in terms of readability, maintainability, and proper coding conventions?
  2. Variable Naming & Consistency: Are variable names meaningful, descriptive, and consistent?
  3. Indentation & Formatting: Are the changes properly indented and formatted according to standard style guides (e.g., PEP8 for Python, Prettier for JavaScript, etc.)?
  4. Potential Bugs & Issues: Are there any logical errors, edge cases, or performance concerns?
  5. Security Concerns: Are there any security vulnerabilities, such as SQL injections, hardcoded credentials, or unsafe user inputs?
  6. Impact Analysis: What effect do these changes have on the overall codebase? Are there potential breaking changes?
  7. Best Practices & Suggestions: How can these changes be improved further?

  Here is the git difference of my staged changes:
  ${context}

  Please analyze it based on the above criteria and give a structured response.
  `;
}

export default ImpactAnalysisSlashCommand;
