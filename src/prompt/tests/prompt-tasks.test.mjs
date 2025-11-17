import { describe, expect, it } from "vitest";
import { buildTasksPrompts, parseTasks } from "../prompt-tasks.mjs";

describe("parseTasks", () => {
  it("splits lines and trims whitespace, ignoring empty lines", () => {
    const input = "Task1~Desc1\n  Task2  \n\nTask3~Desc3\r\n";
    const result = parseTasks(input);
    expect(result).toEqual(["Task1~Desc1", "Task2", "Task3~Desc3"]);
  });

  it("returns empty array for empty or undefined input", () => {
    expect(parseTasks("")).toEqual([]);
    expect(parseTasks(undefined)).toEqual([]);
  });
});

describe("buildTasksPrompts", () => {
  it("adds epic and tickets prompts", () => {
    const prompts = [];
    const result = buildTasksPrompts(prompts);

    expect(result).toHaveLength(2);

    const epicPrompt = result[0];
    expect(epicPrompt.name).toBe("epic");
    expect(epicPrompt.kind).toBe("input");
    expect(epicPrompt.message).toBe("Jira Epic");

    const ticketsPrompt = result[1];
    expect(ticketsPrompt.name).toBe("tickets");
    expect(ticketsPrompt.kind).toBe("editor");
    expect(ticketsPrompt.message).toBe(
      "Input Task Names (one per line). Use form Title~Description, or Title (Title will be used as description).",
    );

    // Test onApply for epic
    const state = {};
    const newStateEpic = epicPrompt.onApply(state, "  My Epic  ");
    expect(newStateEpic).toEqual({ epic: "My Epic" });

    // Test onApply for tickets
    const ticketInput = "Task1\nTask2\n\nTask3";
    const newStateTickets = ticketsPrompt.onApply(state, ticketInput);
    expect(newStateTickets).toEqual({ tickets: ["Task1", "Task2", "Task3"] });
  });
});
