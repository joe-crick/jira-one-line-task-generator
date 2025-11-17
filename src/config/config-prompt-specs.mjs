import { and, array$, conj, notEmpty$, tf } from "ljsp-core";

const HTTP_PREFIX = /^https?:\/\//;
const JIRA_REST_REGEX = /\/rest\/api\//;

/**
 * Returns an array of prompt specifications for Jira settings and projects.
 * @returns {*}
 */
export function getPromptSpecs() {
  // prettier-ignore
  return tf(
    [],
    getJiraBaseUri,
    getJiraAuthToken,
    getJiraProjects
  );
}

/**
 * Adds a Jira Base URI prompt to the prompts array
 * @param {Array} prompts Current array of prompts
 * @returns {Array} Updated prompts array
 * @private
 */
export function getJiraBaseUri(prompts) {
  return conj(prompts, {
    type: "input",
    name: "jiraBaseUri",
    message: "Enter Jira Base URI",
    validate: validateJiraUri,
  });
}

/**
 * Adds a Jira authentication prompt to the prompts array
 * @param {Array} prompts Current array of prompts
 * @returns {Array} Updated prompts array
 * @private
 */
export function getJiraAuthToken(prompts) {
  return conj(prompts, {
    type: "password",
    name: "jiraAuth",
    message: "Enter Jira auth as email:APITOKEN",
    mask: "*",
    validate: validateApiToken,
  });
}

/**
 * Adds a Jira projects prompt to the prompts array
 * @param {Array} prompts Current array of prompts
 * @returns {Array} Updated prompts array
 * @private
 */
export function getJiraProjects(prompts) {
  return conj(prompts, {
    type: "input",
    name: "jiraProjects",
    message: "Enter comma-separated Jira project keys (e.g., ENBL,ABC)",
    filter: (v) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    validate: validateJiraProjectKeys,
  });
}

/**
 * Validates that the input array contains at least one Jira project key
 * @param {string[]} arr Array of project keys
 * @returns {true|string} True if valid, or an error message
 * @private
 */
function validateJiraProjectKeys(arr) {
  return and(array$(arr), notEmpty$(arr)) || "Please provide at least one project key.";
}

/**
 * Validates Jira API token format as "email:APITOKEN"
 * @param {string} v Input value
 * @returns {true|string} True if valid, or an error message
 * @private
 */
function validateApiToken(v) {
  return and(v, v.includes(":")) || "Expected format: email:APITOKEN";
}

/**
 * Validates that the input is a valid Jira REST base URI
 * @param {string} v Input value
 * @returns {true|string} True if valid, or an error message
 * @private
 */
function validateJiraUri(v) {
  return and(HTTP_PREFIX.test(v), JIRA_REST_REGEX.test(v)) || "Please enter a valid Jira REST base URI.";
}
