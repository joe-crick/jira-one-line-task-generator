import { describe, expect, it } from "vitest";
import { validateUserInput } from "../validate-jira-epic.mjs";

describe("validateUserInput", () => {
  it("sets isValid to true when epic prefix matches project key", () => {
    const input = { epic: "PROJ-123", project: "PROJ" };
    const result = validateUserInput(input);
    expect(result).toEqual({ epic: "PROJ-123", project: "PROJ", isValid: true });
  });

  it("sets isValid to false when epic prefix does not match project key", () => {
    const input = { epic: "OTHER-456", project: "PROJ" };
    const result = validateUserInput(input);
    expect(result).toEqual({ epic: "OTHER-456", project: "PROJ", isValid: false });
  });

  it("handles epics with no hyphen", () => {
    const input = { epic: "PROJ", project: "PROJ" };
    const result = validateUserInput(input);
    expect(result).toEqual({ epic: "PROJ", project: "PROJ", isValid: true });
  });

  it("handles empty epic string", () => {
    const input = { epic: "", project: "PROJ" };
    const result = validateUserInput(input);
    expect(result).toEqual({ epic: "", project: "PROJ", isValid: false });
  });
});
