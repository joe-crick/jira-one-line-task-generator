import { beforeEach, describe, expect, it, vi } from "vitest";
import * as mod from "../config-prompts.mjs";
import inquirer from "inquirer";

const { promptJiraSettings } = mod;

// Fixed mock for default export
vi.mock("inquirer", () => {
  return {
    default: {
      prompt: vi.fn(),
    },
  };
});

describe("promptJiraSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns settings object with Jira base URI, auth, and projects", async () => {
    const prompts = [
      { name: "jiraBaseUri", message: "Enter Jira Base URI" },
      { name: "jiraAuth", message: "Enter Jira auth as email:APITOKEN" },
      { name: "jiraProjects", message: "Enter comma-separated Jira project keys" },
    ];

    // Mock inquirer response
    inquirer.prompt.mockResolvedValue({
      jiraBaseUri: "https://jira.example.com/rest/api/",
      jiraAuth: "user@example.com:token",
      jiraProjects: ["ENBL", "ABC"],
    });

    const result = await promptJiraSettings(prompts);

    expect(result).toEqual({
      jiraBaseUri: "https://jira.example.com/rest/api/",
      jiraAuth: "user@example.com:token",
      jiraProjects: ["ENBL", "ABC"],
    });

    expect(inquirer.prompt).toHaveBeenCalledWith(prompts);
  });

  it("handles empty prompts array", async () => {
    inquirer.prompt.mockResolvedValue({});

    const result = await promptJiraSettings([]);

    expect(result).toEqual({ jiraBaseUri: undefined, jiraAuth: undefined, jiraProjects: undefined });
    expect(inquirer.prompt).toHaveBeenCalledWith([]);
  });
});
