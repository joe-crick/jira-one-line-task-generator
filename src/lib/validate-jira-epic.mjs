import { assoc, eq, first, split, tf } from "ljsp-core";

/**
 * Validates that the epic is in the same project as the project key.
 * @param ticketsRecord
 * @returns {*&{isValid: *}}
 */
export function validateUserInput(ticketsRecord) {
  // prettier-ignore
  return tf(
    ticketsRecord,
    getProjectPrefix,
    ({ epicPrefix, project }) => eq(epicPrefix, project),
    (isValid) => (assoc(ticketsRecord, {isValid}))
  )
}

/**
 * Extracts the project prefix from the epic.
 * @param epic
 * @param project
 * @returns {{epicPrefix: *, project: *}}
 */
function getProjectPrefix({ epic, project }) {
  return { epicPrefix: first(split(epic, "-")), project };
}
