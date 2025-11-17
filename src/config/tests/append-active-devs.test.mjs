import { beforeEach, describe, expect, it, vi } from "vitest";
import * as mod from "../append-active-devs.mjs";
import { getActiveDevelopers } from "../../jira/get-active-developers.mjs";

const { appendActiveDevelopers } = mod;

vi.mock("../jira/get-active-developers.mjs", () => ({
  getActiveDevelopers: vi.fn(),
}));

describe("appendActiveDevelopers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches active developers for multiple projects and formats correctly", async () => {
    const settings = {
      jiraProjects: ["ENBL", "ABC"],
    };

    // Mock Jira responses
    getActiveDevelopers.mockImplementation((projectKey) => {
      if (projectKey === "ENBL") {
        return Promise.resolve([
          { displayName: "Alice", accountId: "1" },
          { displayName: "Bob", accountId: "2" },
        ]);
      } else if (projectKey === "ABC") {
        return Promise.resolve([{ displayName: "Charlie", accountId: "3" }]);
      }
      return Promise.resolve([]);
    });

    const result = await appendActiveDevelopers(settings);

    expect(result).toHaveProperty("activeDevelopersByProject");

    expect(result.activeDevelopersByProject).toEqual({
      ENBL: [
        { user: "Alice", account: "1" },
        { user: "Bob", account: "2" },
      ],
      ABC: [{ user: "Charlie", account: "3" }],
    });
  });

  it("handles empty jiraProjects array", async () => {
    const settings = { jiraProjects: [] };

    const result = await appendActiveDevelopers(settings);

    expect(result.activeDevelopersByProject).toEqual({});
    expect(getActiveDevelopers).not.toHaveBeenCalled();
  });

  it("handles errors from getActiveDevelopers gracefully", async () => {
    const settings = { jiraProjects: ["ENBL", "ABC"] };

    getActiveDevelopers.mockImplementation((projectKey) => {
      if (projectKey === "ENBL") return Promise.reject(new Error("API failure"));
      return Promise.resolve([{ displayName: "Charlie", accountId: "3" }]);
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await appendActiveDevelopers(settings);

    expect(result.activeDevelopersByProject).toEqual({
      ENBL: [],
      ABC: [{ user: "Charlie", account: "3" }],
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Warning: Could not fetch active developers for project ENBL during setup:"),
      expect.any(String),
    );

    consoleSpy.mockRestore();
  });
});
