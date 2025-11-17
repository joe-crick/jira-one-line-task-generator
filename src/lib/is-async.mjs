import { eq } from "ljsp-core";

/**
 * Checks if a function is asynchronous (marked as `async`).
 *
 * @param {Function} fn - The function to be checked.
 * @returns {boolean} - `true` if the function is asynchronous, `false` otherwise.
 */
export function isAsync(fn) {
  return eq(fn.constructor.name, "AsyncFunction");
}
