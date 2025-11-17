import { describe, expect, it } from "vitest";
import { projectPrompt, reporterPrompt } from "../prompt-project.mjs";
import { kind } from "../prompt-runner.mjs";

describe("projectPrompt", () => {
  it("adds a project select prompt when jiraProjects exists", () => {
    const config = { jiraProjects: ["PROJ1", "PROJ2"] };
    const prompts = [];
    const result = projectPrompt(config)(prompts);

    expect(result).toHaveLength(1);
    const prompt = result[0];
    expect(prompt.name).toBe("project");
    expect(prompt.kind).toBe(kind.select);
    expect(prompt.message).toBe("Select Jira Project");
    expect(prompt.choices).toEqual(["PROJ1", "PROJ2"]);

    // Test onApply updates state correctly
    const state = {};
    const newState = prompt.onApply(state, "PROJ1");
    expect(newState).toEqual({ project: "PROJ1" });
  });

  it("handles empty jiraProjects gracefully", () => {
    const config = {};
    const prompts = [];
    const result = projectPrompt(config)(prompts);
    expect(result[0].choices).toEqual([]);
  });
});

describe("reporterPrompt", () => {
  it("adds a reporter select prompt with mapped choices", () => {
    const config = {
      activeDevelopersByProject: {
        PROJ1: [
          { user: "Alice", account: "a1" },
          { user: "Bob", account: "b1" },
        ],
      },
    };
    const prompts = [];
    const result = reporterPrompt(config)(prompts);
    expect(result).toHaveLength(1);

    const prompt = result[0];
    expect(prompt.name).toBe("reporter");
    expect(prompt.kind).toBe(kind.select);
    expect(prompt.message).toBe("Select Task Reporter");

    // The choices function returns mapped developers
    const choices = prompt.choices({ project: "PROJ1" });
    expect(choices).toEqual([
      { name: "Alice", value: "a1" },
      { name: "Bob", value: "b1" },
    ]);

    // Test onApply updates state correctly
    const state = {};
    const newState = prompt.onApply(state, "a1");
    expect(newState).toEqual({ reporter: "a1" });
  });

  it("returns empty array when no developers for project", () => {
    const config = { activeDevelopersByProject: {} };
    const prompts = [];
    const prompt = reporterPrompt(config)(prompts)[0];
    const choices = prompt.choices({ project: "PROJ1" });
    expect(choices).toEqual([]);
  });
});
