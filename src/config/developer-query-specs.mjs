import { map, tf } from "ljsp-core";

/**
 * Produces an array of specs from the provided cfg, one per Jira project.
 * A spec is a simple object: { projectKey: string }
 * @param {{ jiraProjects: string[] }} cfg
 * @returns {{ projectKey: string }[]}
 * @private
 */
export function buildActiveDeveloperQuerySpecs(cfg) {
  // prettier-ignore
  return tf(
    cfg,
    ({ jiraProjects }) => jiraProjects,
    (projects) => map((p) => ({ projectKey: p }), projects),
  );
}
