import { parseTasks } from "../src/prompt/prompt-tasks.mjs";

describe("parseTasks", () => {
  test("returns empty array for empty input", () => {
    expect(parseTasks("")).toEqual([]);
    expect(parseTasks(null)).toEqual([]);
    expect(parseTasks(undefined)).toEqual([]);
  });

  test("splits by newlines, trims and removes empty lines", () => {
    const input = "  Task A  \n\nTask B\n  Task C  \n";
    expect(parseTasks(input)).toEqual(["Task A", "Task B", "Task C"]);
  });
});
