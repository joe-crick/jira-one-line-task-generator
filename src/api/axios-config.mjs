import { cond, ELSE, str, tf } from "ljsp-core";
import { getRuntimeConfig } from "../config/config.mjs";

/**
 * Builds a standard Axios config for Jira using a base URI from config and the provided
 * HTTP method and API path.
 *
 * Source precedence:
 * - .task-gen.conf via runtime config (preferred)
 * - Fallback to environment variables if config not populated
 *
 * @param {"get"|"post"|"put"|"patch"|"delete"} method
 * @param {string} apiPath - Jira API path (e.g. "/project/ENBL/role"). If a full URL
 *                           (starts with "http"), it will be used as-is.
 * @returns {import("axios").AxiosRequestConfig}
 */
export function getAxiosConfig(method, apiPath) {
  // prettier-ignore
  return tf(
    getRuntimeConfig(),
    ({ jiraBaseUri, jiraAuth }) => ({
      method,
      url: getUri(apiPath, jiraBaseUri),
      headers: {
        Authorization: encodeBasicAuth(jiraAuth),
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }),
  );
}

/**
 * Encodes a basic auth string for use in the Authorization header.
 * @param jiraAuth
 * @returns {string|*}
 */
function encodeBasicAuth(jiraAuth) {
  return str("Basic ", Buffer.from(jiraAuth).toString("base64"));
}

/**
 * Returns the full URI for the API path, taking into account the base URI from config.
 * No checks for URI correctness, assumes user knows the correct format.
 * @param apiPath
 * @param base
 * @returns {*}
 */
function getUri(apiPath, base) {
  // prettier-ignore
  return cond(
    isAbsolute(apiPath), apiPath,
    ELSE, `${base}${apiPath}`
  );
}

/**
 * Returns true if the provided string is a fully qualified URL.
 * @param s
 * @returns {boolean}
 */
function isAbsolute(s) {
  return /^https?:\/\//i.test(s || "");
}
