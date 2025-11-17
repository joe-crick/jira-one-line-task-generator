import axios from "axios";
import { getAxiosConfig } from "./axios-config.mjs";
import { assoc, dissoc, tf } from "ljsp-core";
import { atf } from "../lib/atf.mjs";

const httpMethod = {
  post: "post",
  get: "get",
};

/**
 * Simple wrapper to POST data to Jira using the base config.
 *
 * @param {object} payload - The request body to send to Jira.
 * @returns {Promise<import("axios").AxiosResponse>} Axios response.
 */
export async function postJiraData(payload) {
  // prettier-ignore
  return tf(
    getAxiosConfig(httpMethod.post, "/issue"),
    (axiosConfig) => assoc(axiosConfig, {data: payload}),
    (axiosConfig) => axios(axiosConfig)
  );
}

/**
 * Simple wrapper to GET data from Jira (or any Jira REST endpoint).
 *
 * @param {string} apiPathOrUrl - Jira API path (e.g., "/project/ENBL/role") or full URL.
 * @returns {Promise<any>} Parsed response data.
 */
export async function getJiraData(apiPathOrUrl) {
  // prettier-ignore
  return atf(
    getAxiosConfig(httpMethod.get, apiPathOrUrl),
    (axiosConfig) => dissoc(axiosConfig, "data"),
    async (axiosConfig) => await axios(axiosConfig),
    ({data}) => data
  );
}
