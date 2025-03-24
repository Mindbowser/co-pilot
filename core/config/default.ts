import {
  ContextProviderWithParams,
  ModelDescription,
  SerializedContinueConfig,
  SlashCommandDescription,
} from "../";

export const DEFAULT_CHAT_MODEL_CONFIG: ModelDescription[] = [
  {
    "model": "claude-3-5-haiku-latest",
    "title": "Claude 3.5 Haiku",
    "apiKey": "",
    "provider": "anthropic"
  },
];

export const DEFAULT_AUTOCOMPLETE_MODEL_CONFIG: ModelDescription = {
  "model": "claude-3-5-haiku-latest",
  "title": "Claude 3.5 Haiku",
  "apiKey": "",
  "provider": "anthropic"
};

export const FREE_TRIAL_MODELS: ModelDescription[] = [
  {
    title: "Claude 3.5 Sonnet (Free Trial)",
    provider: "free-trial",
    model: "claude-3-5-sonnet-latest",
    systemMessage:
      "You are an expert software developer. You give helpful and concise responses.",
  },
  {
    title: "GPT-4o (Free Trial)",
    provider: "free-trial",
    model: "gpt-4o",
    systemMessage:
      "You are an expert software developer. You give helpful and concise responses.",
  },
  {
    title: "Llama3.1 70b (Free Trial)",
    provider: "free-trial",
    model: "llama3.1-70b",
    systemMessage:
      "You are an expert software developer. You give helpful and concise responses.",
  },
  {
    title: "Codestral (Free Trial)",
    provider: "free-trial",
    model: "codestral-latest",
    systemMessage:
      "You are an expert software developer. You give helpful and concise responses.",
  },
];

export const defaultContextProvidersVsCode: ContextProviderWithParams[] = [
  { name: "code", params: {} },
  { name: "docs", params: {} },
  { name: "diff", params: {} },
  { name: "terminal", params: {} },
  { name: "problems", params: {} },
  { name: "folder", params: {} },
  { name: "remote-codebase", params: {} },
  { name: "codebase", params: {} },
];

export const defaultContextProvidersJetBrains: ContextProviderWithParams[] = [
  { name: "diff", params: {} },
  { name: "folder", params: {} },
  { name: "codebase", params: {} },
];

export const defaultSlashCommandsVscode: SlashCommandDescription[] = [
  {
    name: "share",
    description: "Export the current chat session to markdown",
  },
  {
    name: "cmd",
    description: "Generate a shell command",
  },
  {
    name: "git:add",
    description: "Stage all changes for the next commit",
  },
  {
    name: "git:commit",
    description: "Commit changes with a custom message",
  },
  {
    name: "commit",
    description: "Generate a git commit message",
  },
  {
    name: "review:help",
    description: "List all the available review commands with description",
  },
  {
    name: "review:codebase",
    description: "Review entire codebase and give feedback",
  },
  {
    name: "review:stage",
    description: "Review stage difference code and give feedback",
  },
  {
    name: "review:stage:naming-convention",
    description: "Review naming convention in stage difference code and give feedback",
  },
  {
    name: "review:stage:duplications",
    description: "Review duplications in stage difference code and give feedback",
  },
  {
    name: "review:stage:comments",
    description: "Review comments in stage difference code and give feedback",
  },
  {
    name: "review:stage:memory-leaks",
    description: "Review memory leaks in stage difference code and give feedback",
  },
  {
    name: "review:stage:compliance",
    description: "Review compliance in stage difference code and give feedback",
  },
  {
    name: "review:stage:logging",
    description: "Review logging in stage difference code and give feedback",
  },
  {
    name: "review:stage:refactoring",
    description: "Review refactoring in stage difference code and give feedback",
  },
  {
    name: "onboard",
    description: "Familiarize yourself with the codebase",
  },
  {
    name: "project-flow",
    description: "Project Flow chart.",
  },
  {
    name: "create-readme",
    description: "Create readme file context.",
  },
  {
    name: "impact-analysis",
    description: "Generate a real-time impact analysis report",
  },
  {
    name: "code-stats",
    description: "Generate stats of the codebase.",
  },
];

export const defaultSlashCommandsJetBrains = [
  {
    name: "share",
    description: "Export the current chat session to markdown",
  },
  {
    name: "commit",
    description: "Generate a git commit message",
  },
];

export const defaultConfig: SerializedContinueConfig = {
  models: [...DEFAULT_CHAT_MODEL_CONFIG],
  tabAutocompleteModel: DEFAULT_AUTOCOMPLETE_MODEL_CONFIG,
  contextProviders: defaultContextProvidersVsCode,
  slashCommands: defaultSlashCommandsVscode,
};

export const defaultConfigJetBrains: SerializedContinueConfig = {
  models: [...DEFAULT_CHAT_MODEL_CONFIG],
  tabAutocompleteModel: DEFAULT_AUTOCOMPLETE_MODEL_CONFIG,
  contextProviders: defaultContextProvidersJetBrains,
  slashCommands: defaultSlashCommandsJetBrains,
};
