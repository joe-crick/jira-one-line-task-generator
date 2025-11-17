import { atf } from "../lib/atf.mjs";
import { assoc, entries, map, not, or } from "ljsp-core";
import { getActiveDevelopers } from "../jira/get-active-developers.mjs";
import { buildActiveDeveloperQuerySpecs } from "./developer-query-specs.mjs";

/**
 * Composes Step 1 and Step 2, and attaches the result to cfg.
 * This replaces the original getActiveDevelopersForProjects by splitting the logic into two steps.
 * @param cfg
 * @returns {Promise<*>}
 * @private
 */
export async function appendActiveDevelopers(cfg) {
  // prettier-ignore
  return atf(
    cfg,
    buildActiveDeveloperQuerySpecs,
    fetchDevelopersByProject,
    buildDevelopersPerProject,
    (activeDevelopersByProject) => assoc(cfg, { activeDevelopersByProject }),
  );
}

/**
 * Returns an object keyed by project with raw developer entries from Jira.
 * @param {{ projectKey: string }[]} specs
 * @param {Object} acc
 * @returns {Promise<Object>} { [projectKey]: RawDeveloper[] }
 * @private
 */
async function fetchDevelopersByProject([spec, ...rest], acc = {}) {
  if (not(spec)) return acc;
  const { projectKey } = spec;
  try {
    acc[projectKey] = await getActiveDevelopers(projectKey);
  } catch (e) {
    console.error(
      `Warning: Could not fetch active developers for project ${projectKey} during setup:`,
      or(e?.message, e),
    );
    acc[projectKey] = [];
  }
  return fetchDevelopersByProject(rest, acc);
}

/**
 * Transforms raw Jira user objects to minimal { user, account } entries per project.
 * @param {{ [projectKey: string]: any[] }} rawByProject
 * @returns {{ [projectKey: string]: { user: string, account: string }[] }}
 * @private
 */
function buildDevelopersPerProject(rawByProject) {
  return Object.fromEntries(
    map(
      ([key, devs]) => [key, map((d) => ({ user: d.displayName, account: d.accountId }), devs || [])],
      entries(rawByProject),
    ),
  );
}
