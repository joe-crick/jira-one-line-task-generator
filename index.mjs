import { ensureConfigured } from "./src/config/config-setup.mjs";
import { atf } from "./src/lib/atf.mjs";
import { createMessages, logMessages } from "./src/lib/logger.mjs";
import { createUserPromptSpecs } from "./src/jira/create-ticket-records.mjs";
import { createJiraTicketSpecs, createJiraTickets } from "./src/jira/create-jira-tickets.mjs";
import { promptRunner } from "./src/prompt/prompt-runner.mjs";
import { validateUserInput } from "./src/lib/validate-jira-epic.mjs";
import { getRuntimeConfig } from "./src/config/config.mjs";

const runUserPrompts = promptRunner({
  project: "",
  epic: "",
  tickets: [],
  reporter: "",
  isValid: true,
  cancelled: false,
});

(async function main() {
  await ensureConfigured();

  // prettier-ignore
  await atf(
    getRuntimeConfig(),
    createUserPromptSpecs,
    runUserPrompts,
    validateUserInput,
    createJiraTicketSpecs,
    createJiraTickets,
    createMessages,
    logMessages
  );
})();
