import { describe, expect, it, vi } from "vitest";
import { createMessages, logMessages } from "../logger.mjs";

describe("logMessages", () => {
  it("logs each message in the array", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    const messages = ["first", "second", "third"];
    logMessages(messages);

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenNthCalledWith(1, "first");
    expect(spy).toHaveBeenNthCalledWith(2, "second");
    expect(spy).toHaveBeenNthCalledWith(3, "third");

    spy.mockRestore();
  });

  it("does nothing when given an empty array", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    logMessages([]);
    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });

  it("does nothing when called with undefined", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    logMessages();
    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});

describe("createMessages", () => {
  it("returns epic invalid message when results are empty", () => {
    const results = [];
    const messages = createMessages(results);
    expect(messages).toEqual(["Epic does not match project prefix. Aborting."]);
  });

  it("returns success messages for successful tickets", () => {
    const results = [
      { status: "success", title: "Task 1" },
      { status: "success", title: "Task 2" },
    ];
    const messages = createMessages(results);
    expect(messages).toEqual(["Successfully created ticket: Task 1", "Successfully created ticket: Task 2"]);
  });

  it("returns failure messages for failed tickets", () => {
    const results = [{ status: "error", title: "Task 1", error: "Some error" }];
    const messages = createMessages(results);
    expect(messages).toEqual(["Failed to create ticket: Task 1. Error: Some error"]);
  });

  it("mix of success and failure messages", () => {
    const results = [
      { status: "success", title: "Task 1" },
      { status: "error", title: "Task 2", error: "Oops" },
    ];
    const messages = createMessages(results);
    expect(messages).toEqual(["Successfully created ticket: Task 1", "Failed to create ticket: Task 2. Error: Oops"]);
  });
});
