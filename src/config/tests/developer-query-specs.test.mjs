import { describe, expect, it } from "vitest";
import { buildActiveDeveloperQuerySpecs } from "../developer-query-specs.mjs";

describe("buildActiveDeveloperQuerySpecs", () => {
  it("maps jiraProjects to array of { projectKey } objects", () => {
    const settings = {
      jiraProjects: ["ENBL", "ABC", "XYZ"],
    };

    const result = buildActiveDeveloperQuerySpecs(settings);

    expect(result).toEqual([{ projectKey: "ENBL" }, { projectKey: "ABC" }, { projectKey: "XYZ" }]);
  });

  it("returns empty array if jiraProjects is empty", () => {
    const settings = { jiraProjects: [] };

    const result = buildActiveDeveloperQuerySpecs(settings);

    expect(result).toEqual([]);
  });

  it("handles single project", () => {
    const settings = { jiraProjects: ["ENBL"] };

    const result = buildActiveDeveloperQuerySpecs(settings);

    expect(result).toEqual([{ projectKey: "ENBL" }]);
  });
});
