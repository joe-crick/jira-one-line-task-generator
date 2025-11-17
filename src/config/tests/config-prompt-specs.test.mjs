import { describe, expect, it } from "vitest";
import { getJiraAuthToken, getJiraBaseUri, getJiraProjects } from "../config-prompt-specs.mjs";

describe("Prompt constructors", () => {
  it("getJiraBaseUri adds the correct prompt", () => {
    const prompts = [];
    const result = getJiraBaseUri(prompts);

    expect(result.length).toBe(1);
    const p = result[0];

    expect(p.type).toBe("input");
    expect(p.name).toBe("jiraBaseUri");
    expect(p.message).toBe("Enter Jira Base URI");
    expect(p.validate).toBeInstanceOf(Function);
  });

  it("getJiraAuthToken adds the correct prompt", () => {
    const prompts = [];
    const result = getJiraAuthToken(prompts);

    expect(result.length).toBe(1);
    const p = result[0];

    expect(p.type).toBe("password");
    expect(p.name).toBe("jiraAuth");
    expect(p.message).toBe("Enter Jira auth as email:APITOKEN");
    expect(p.mask).toBe("*");
    expect(p.validate).toBeInstanceOf(Function);
  });

  it("getJiraProjects adds the correct prompt", () => {
    const prompts = [];
    const result = getJiraProjects(prompts);

    expect(result.length).toBe(1);
    const p = result[0];

    expect(p.type).toBe("input");
    expect(p.name).toBe("jiraProjects");
    expect(p.message).toContain("Enter comma-separated Jira project keys");
    expect(p.filter).toBeInstanceOf(Function);
    expect(p.validate).toBeInstanceOf(Function);

    // Test the filter
    const filtered = p.filter(" ENBL ,  ABC ,,");
    expect(filtered).toEqual(["ENBL", "ABC"]);
  });
});
