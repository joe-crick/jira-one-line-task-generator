import { atf } from "../lib/atf.mjs";
import inquirer from "inquirer";

/**
 * Prompts the user for Jira settings and projects, returning a settings object.
 * @param prompts
 * @returns {Promise<{ jiraBaseUri: string, jiraAuth: string, jiraProjects: string[] }>}
 * @private
 */
export async function promptJiraSettings(prompts) {
  // prettier-ignore
  return atf(
    prompts,
    async (prompts) =>  await inquirer.prompt(prompts),
    ({ jiraBaseUri, jiraAuth, jiraProjects }) => ({ jiraBaseUri, jiraAuth, jiraProjects })
  )
}
