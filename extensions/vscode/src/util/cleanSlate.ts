
import { ExtensionContext } from "vscode";

/**
 * Clear all Epico Pilot-related artifacts to simulate a brand new user
 */
export function cleanSlate(context: ExtensionContext) {
  // Commented just to be safe
  // // Remove ~/.epico-pilot
  // const continuePath = getContinueGlobalPath();
  // if (fs.existsSync(continuePath)) {
  //   fs.rmSync(continuePath, { recursive: true, force: true });
  // }
  // // Clear extension's globalState
  // context.globalState.keys().forEach((key) => {
  //   context.globalState.update(key, undefined);
  // });
}
