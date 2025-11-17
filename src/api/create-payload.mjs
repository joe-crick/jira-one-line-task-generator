import { contains$, split, tf } from "ljsp-core";

/**
 * Creates the payload for the Jira ticket.
 *
 * @param project
 * @param epic
 * @param {string} title - The title of the ticket.
 * @param {string} [reporterAccountId] - Optional reporter accountId; falls back to env JIRA_REPORTER if not provided.
 * @returns {Object} - The payload object to be sent to the Jira API.
 */
export function createPayload(project, epic, title, reporterAccountId) {
  // prettier-ignore
  return tf(
    title,
    getTicketText,
    ([summary, description]) => ({
      fields: {
        project: { key: project },
        summary: summary,
        issuetype: { name: "Task" },
        description: {
          content: [
            {
              content: [
                {
                  text: description,
                  type: "text",
                },
              ],
              type: "paragraph",
            },
          ],
          type: "doc",
          version: 1,
        },
        reporter: { accountId: reporterAccountId },
        parent: { key: epic },
      },
  }));
}

/**
 * Splits the ticket title into summary and description based on the "~" separator.
 * @param title
 * @returns {*|*[]}
 */
function getTicketText(title) {
  return contains$(title, "~") ? split(title, "~") : [title, title];
}
