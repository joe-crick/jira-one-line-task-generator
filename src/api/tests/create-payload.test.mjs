import { describe, expect, it } from "vitest";
import * as mod from "../create-payload.mjs";

const { createPayload } = mod;

describe("createPayload", () => {
  const project = "ENBL";
  const epic = "EPIC-1";

  it("splits title using '~' and sets summary and description", () => {
    const title = "Task summary~Task description";
    const reporterId = "account-123";

    const payload = createPayload(project, epic, title, reporterId);

    expect(payload).toHaveProperty("fields");
    const fields = payload.fields;

    expect(fields.project.key).toBe(project);
    expect(fields.summary).toBe("Task summary");
    expect(fields.issuetype.name).toBe("Task");
    expect(fields.description.content[0].content[0].text).toBe("Task description");
    expect(fields.reporter.accountId).toBe(reporterId);
    expect(fields.parent.key).toBe(epic);
  });

  it("uses title for both summary and description if '~' is missing", () => {
    const title = "Single line task";
    const reporterId = "account-123";

    const payload = createPayload(project, epic, title, reporterId);
    const fields = payload.fields;

    expect(fields.summary).toBe(title);
    expect(fields.description.content[0].content[0].text).toBe(title);
  });

  it("handles optional reporterAccountId (undefined)", () => {
    const title = "Task title~Task desc";

    const payload = createPayload(project, epic, title);
    const fields = payload.fields;

    expect(fields.reporter.accountId).toBeUndefined();
  });
});
