import { access, readFile, writeFile } from "fs/promises";
import { constants as fsConstants } from "fs";
import { or } from "ljsp-core";
import { atf } from "../lib/atf.mjs";

const CONFIG_PATH = ".task-gen.conf";

/**
 * A developer entry used for mapping project → developers.
 *
 * @typedef {Object} ActiveDeveloper
 * @property {string} user - The human-readable user name.
 * @property {string} account - The Jira accountId or equivalent backend identifier.
 */

/**
 * Mapping of project keys to arrays of developers.
 *
 * @typedef {Object.<string, ActiveDeveloper[]>} ActiveDevelopersByProject
 */

/**
 * The full application configuration as stored in `.task-gen.conf`.
 *
 * @typedef {Object} AppConfig
 * @property {string[]} jiraProjects - List of Jira project keys.
 * @property {string} jiraBaseUri - Base REST URI for Jira cloud/server.
 * @property {string} jiraAuth - Base64 authorization header value.
 * @property {ActiveDevelopersByProject} activeDevelopersByProject - Developers grouped by project.
 */

const UTF8 = "utf8";
let runtimeConfig = undefined;

/**
 * Checks whether the configuration file exists on disk.
 *
 * @async
 * @returns {Promise<boolean>}
 *   `true` if the config file exists, otherwise `false`.
 */
export async function configExists() {
  try {
    await access(CONFIG_PATH, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sets the in-memory runtime configuration.
 * Passing `null` resets the runtime config to an empty placeholder.
 *
 * @param {AppConfig|null} cfg - The configuration to store.
 */
export function setRuntimeConfig(cfg) {
  runtimeConfig = or(cfg, undefined);
  return cfg;
}

/**
 * Returns the current in-memory configuration.
 * If it has not yet been loaded, returns a default empty configuration.
 *
 * @returns {AppConfig}
 *   The current runtime configuration or a fallback placeholder config.
 */
export function getRuntimeConfig() {
  return or(runtimeConfig, {
    jiraProjects: [],
    jiraBaseUri: "",
    jiraAuth: "",
    activeDevelopersByProject: {},
  });
}

/**
 * Loads the configuration file from disk, parses it,
 * updates runtime config, and returns the parsed config.
 *
 * @async
 * @returns {Promise<AppConfig>}
 *   The parsed (and possibly upgraded) application configuration.
 *
 * @throws {Error}
 *   If the config file cannot be read or parsed.
 */
export async function loadConfig() {
  // prettier-ignore
  return atf(
    "",
    async () => await readFile(CONFIG_PATH, UTF8),
    (content) => JSON.parse(content),
    setRuntimeConfig
  )
}

/**
 * Saves the provided configuration to disk and updates
 * the in-memory runtime configuration.
 *
 * @async
 * @param {AppConfig} cfg - The configuration object to save.
 * @returns {Promise<void>}
 */
export async function saveConfig(cfg) {
  // prettier-ignore
  await atf(
    JSON.stringify(cfg, null, 2),
    async (json) => await writeFile(CONFIG_PATH, json, UTF8),
    () => setRuntimeConfig(cfg)
  );
}
