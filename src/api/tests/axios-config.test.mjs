import { beforeEach, describe, expect, it, vi } from "vitest";
import * as mod from "../axios-config.mjs";
import { getRuntimeConfig } from "../../config/config.mjs";

const { getAxiosConfig } = mod;

vi.mock("../../config/config.mjs", () => ({
  getRuntimeConfig: vi.fn(),
}));

describe("getAxiosConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds correct Axios config with relative API path", () => {
    getRuntimeConfig.mockReturnValue({
      jiraBaseUri: "https://example.atlassian.net",
      jiraAuth: "user@example.com:APITOKEN",
    });

    const config = getAxiosConfig("get", "/rest/api/3/project");

    expect(config.method).toBe("get");
    expect(config.url).toBe("https://example.atlassian.net/rest/api/3/project");
    expect(config.headers).toHaveProperty(
      "Authorization",
      "Basic " + Buffer.from("user@example.com:APITOKEN").toString("base64"),
    );
    expect(config.headers.Accept).toBe("application/json");
    expect(config.headers["Content-Type"]).toBe("application/json");
  });

  it("uses absolute API path as-is", () => {
    getRuntimeConfig.mockReturnValue({
      jiraBaseUri: "https://example.atlassian.net",
      jiraAuth: "user@example.com:APITOKEN",
    });

    const absoluteUrl = "https://another.jira.com/rest/api/3/project";
    const config = getAxiosConfig("post", absoluteUrl);

    expect(config.url).toBe(absoluteUrl);
  });

  it("handles empty runtime config gracefully", () => {
    getRuntimeConfig.mockReturnValue({
      jiraBaseUri: "",
      jiraAuth: "",
    });

    const config = getAxiosConfig("get", "/project/ENBL");

    expect(config.url).toBe("/project/ENBL"); // base is empty
    expect(config.headers.Authorization).toBe("Basic " + Buffer.from("").toString("base64"));
  });
});
