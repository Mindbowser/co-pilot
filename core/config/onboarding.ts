import { SerializedContinueConfig } from "../";

import { DEFAULT_AUTOCOMPLETE_MODEL_CONFIG, DEFAULT_CHAT_MODEL_CONFIG } from "./default";

export const TRIAL_FIM_MODEL = "codestral-latest";
export const LOCAL_ONBOARDING_PROVIDER_TITLE = "Ollama";
export const LOCAL_ONBOARDING_FIM_MODEL = "qwen2.5-coder:1.5b-base";
export const LOCAL_ONBOARDING_FIM_TITLE = "Qwen2.5-Coder 1.5B";
export const LOCAL_ONBOARDING_CHAT_MODEL = "llama3.1:8b";
export const LOCAL_ONBOARDING_CHAT_TITLE = "Llama 3.1 8B";
export const LOCAL_ONBOARDING_EMBEDDINGS_MODEL = "nomic-embed-text:latest";

/**
 * We set the "best" chat + autocopmlete models by default
 * whenever a user doesn't have a config.json
 */
export function setupBestConfig(
  config: SerializedContinueConfig,
): SerializedContinueConfig {
  return {
    ...config,
    models: [
      ...DEFAULT_CHAT_MODEL_CONFIG,
    ],
    tabAutocompleteModel: DEFAULT_AUTOCOMPLETE_MODEL_CONFIG,
  };
}

export function setupLocalConfig(
  config: SerializedContinueConfig,
): SerializedContinueConfig {
  return {
    ...config,
    models: [
      ...DEFAULT_CHAT_MODEL_CONFIG,
    ],
    tabAutocompleteModel: DEFAULT_AUTOCOMPLETE_MODEL_CONFIG,
  };
}

export function setupQuickstartConfig(
  config: SerializedContinueConfig,
): SerializedContinueConfig {
  return {
    ...config,
    models: [
      ...DEFAULT_CHAT_MODEL_CONFIG,
    ],
    tabAutocompleteModel: DEFAULT_AUTOCOMPLETE_MODEL_CONFIG,
  };
}
