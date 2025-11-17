import { projectPrompt, reporterPrompt } from "../prompt/prompt-project.mjs";
import { buildTasksPrompts } from "../prompt/prompt-tasks.mjs";
import { tf } from "ljsp-core";

/**
 * Collects all user inputs via prompts.
 */
export async function createUserPromptSpecs(cfg) {
  const buildProjectPrompt = projectPrompt(cfg);
  const buildReporterPrompt = reporterPrompt(cfg);
  // prettier-ignore
  return tf(
    [],
    buildProjectPrompt,
    buildReporterPrompt,
    buildTasksPrompts,
  )
}
