import { atf } from "../lib/atf.mjs";
import { createPayload } from "../api/create-payload.mjs";
import { postJiraData } from "../api/jira-api.mjs";
import { map, or, tf, trim } from "ljsp-core";

/**
 * Creates a single Jira ticket using ATF helper.
 */
export async function createJiraTickets(tickets) {
  return Promise.all(
    map(({ project, epic, title, reporter }) => {
      try {
        return atf(
          "",
          () => createPayload(project, epic, title, reporter),
          postJiraData,
          () => ({ status: "success", title }),
        );
      } catch (error) {
        return {
          status: "error",
          title,
          error: or(error.response?.data, error.message),
        };
      }
    }, tickets),
  );
}

/**
 * Recursively processes all tickets in sequence.
 */
export async function createJiraTicketSpecs({ project, epic, tickets, reporter, isValid }) {
  return isValid
    ? // prettier-ignore
      map((ticket) =>
            tf(
              trim(ticket),
              (ticket) => ({ project, epic, title: ticket, reporter })
            ),
          tickets,
        )
    : [];
}
