import { log, not, tf } from "ljsp-core";
import { configExists, getRuntimeConfig, loadConfig, saveConfig, setRuntimeConfig } from "./config.mjs";
import { atf } from "../lib/atf.mjs";
import { promptJiraSettings } from "./config-prompts.mjs";
import { appendActiveDevelopers } from "./append-active-devs.mjs";
import { getPromptSpecs } from "./config-prompt-specs.mjs";

/**
 * Ensures the application configuration is available in runtime.
 * - If the config file does not exist, runs an interactive setup and writes it.
 * - Otherwise, loads the existing config.
 * In all cases, sets the runtime config for downstream modules to use.
 * @async
 */
export async function ensureConfigured() {
  if (not(await configExists())) {
    await configureApp();
  } else {
    await loadConfig();
  }
  // prettier-ignore
  tf(
    getRuntimeConfig(),
    setRuntimeConfig
  )
}

/**
 * Interactive configuration that gathers Jira settings and projects, fetches active developers
 * per project, and writes the .task-gen.conf file via saveConfig().
 * This function is local to this module; use ensureConfigured() from callers.
 * @async
 * @private
 */
async function configureApp() {
  // prettier-ignore
  await atf(
    getPromptSpecs(),
    promptJiraSettings,
    setRuntimeConfig, // must be set here to have runtime vals for Jira access
    appendActiveDevelopers,
    saveConfig
  )

  log("Configuration saved to .task-gen.conf");
}
