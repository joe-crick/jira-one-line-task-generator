import { array$, assoc, conj, map, or, tf } from "ljsp-core";
import { kind } from "./prompt-runner.mjs";

/**
 * Build a select prompt for Jira projects based on runtime config.
 */
export const projectPrompt = (config) => (prompts) => {
  // prettier-ignore
  return tf(
    config,
    (cfg) => array$(cfg.jiraProjects) ? cfg.jiraProjects : [],
    (projects) => conj(prompts,
      {
        name: "project",
        kind: kind.select,
        message: "Select Jira Project",
        choices: projects,
        onApply: (state, value) => assoc(state, { project: value ?? "" }),
      }
    )
  )
};

/**
 * Build a select prompt for reporter based on selected project.
 * @returns {import('./types').PromptSpec}
 */
export const reporterPrompt = (config) => (prompts) => {
  return conj(prompts, {
    name: "reporter",
    kind: kind.select,
    message: "Select Task Reporter",
    choices: (state) => {
      // prettier-ignore
      return tf(
          config,
          (cfg) => or(cfg.activeDevelopersByProject, {})[state.project] || [],
          (devsForProject) =>  map((dev) => ({ name: dev.user, value: dev.account }), devsForProject)
        )
    },
    onApply: (state, value) => assoc(state, { reporter: value ?? "" }),
  });
};
