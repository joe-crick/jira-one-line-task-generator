import { cond, ELSE, empty$, eq, log, map, not } from "ljsp-core";

/**
 * The ONLY function that performs logging.
 *
 * @param {string[]}
 */
export function logMessages([first, ...rest] = []) {
  if (not(first)) return;
  log(first);
  logMessages(rest);
}

/**
 * Convert ticket results to plain log messages.
 */
export function createMessages(results) {
  // prettier-ignore
  return cond(
    epicWasInvalid(results), ["Epic does not match project prefix. Aborting."],
    ELSE, () => map((result) => {
      return eq(result.status, "success")
        ? `Successfully created ticket: ${result.title}`
        : `Failed to create ticket: ${result.title}. Error: ${result.error}`;
    }, results)
  )
}

/**
 * Check if epic was invalid.
 * @param results
 * @returns {boolean}
 */
function epicWasInvalid(results) {
  return empty$(results);
}
