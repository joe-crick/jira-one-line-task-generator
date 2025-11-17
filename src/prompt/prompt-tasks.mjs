import { assoc, conj, or } from "ljsp-core";

const EMPTY = "";
const LABEL_JIRA_EPIC = "Jira Epic";
const LABEL_TASKS_INPUT =
  "Input Task Names (one per line). Use form Title~Description, or Title (Title will be used as description).";

/**
 * Pure builders returning PromptSpec objects for epic and tasks.
 */
export function buildTasksPrompts(prompts) {
  return conj(
    prompts,
    {
      name: "epic",
      kind: "input",
      message: LABEL_JIRA_EPIC,
      onApply: (state, value) =>
        assoc(state, {
          epic: String(value ?? EMPTY).trim(),
        }),
    },
    {
      name: "tickets",
      kind: "editor",
      message: LABEL_TASKS_INPUT,
      onApply: (state, value) => assoc(state, { tickets: parseTasks(value) }),
    },
  );
}

/**
 * Parse a string of tasks into an array of strings.
 * @param text
 * @returns {string[]}
 */
export function parseTasks(text) {
  return String(or(text, EMPTY))
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}
