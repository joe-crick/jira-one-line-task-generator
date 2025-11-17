import { eq, filter, map } from "ljsp-core";
import { getJiraData } from "../api/jira-api.mjs";
import { atf } from "../lib/atf.mjs";

/**
 * Fetches all active developers for a given project.
 *
 * @param {string} project - The Jira project key or ID.
 * @returns {Promise<Array<Object>>} A promise that resolves to a list of active developer objects.
 */
export async function getActiveDevelopers(project) {
  // prettier-ignore
  return atf(
    project,
    getDevRolesURI,
    getAllDevelopers,
    filterActiveDevelopers
  )
}

/**
 * Filters a list of developers to only include active ones.
 *
 * @param {Array<Object>} developers - List of developer objects.
 * @returns {Array<Object>} Filtered list of active developers.
 */
function filterActiveDevelopers(developers) {
  return filter((dev) => eq(dev.active, true), developers);
}

/**
 * Fetches detailed developer information from a Jira role URI.
 *
 * @param {string} developerRoleURI - The URI of the developer role in Jira.
 * @returns {Promise<Array<Object>>} A promise that resolves to a list of developer objects.
 */
async function getAllDevelopers(developerRoleURI) {
  // prettier-ignore
  return atf(
    developerRoleURI,
    getJiraData,
    ({ actors: assignedDevelopers }) => createDeveloperList(assignedDevelopers)
  )
}

/**
 * Recursively fetches detailed information for each developer in a list.
 *
 * @param {Array<Object>} developers - List of developer actor objects from Jira.
 * @returns {Promise<Array<Object>>} A promise that resolves to a list of developer objects.
 */
async function createDeveloperList(developers) {
  return Promise.all(
    // prettier-ignore
    map((dev) => atf(
      dev,
      getAccountUri,
      getJiraData,
    ), developers),
  );
}

/**
 * Extracts the Jira account ID from a user object.
 *
 * @param {Object} user - A Jira actor user object.
 * @returns {string} The account ID of the user.
 */
function getAccountUri({ actorUser: { accountId } }) {
  return `/user?accountId=${accountId}`;
}

/**
 * Fetches the URI for the "Developers" role in a project.
 *
 * @param {string} project - The Jira project key or ID.
 * @returns {Promise<string>} A promise that resolves to the Developers role URI.
 */
async function getDevRolesURI(project) {
  // prettier-ignore
  return atf(
    await getJiraData(`/project/${project}/role`),
    ({ Developers }) => Developers
  )
}
