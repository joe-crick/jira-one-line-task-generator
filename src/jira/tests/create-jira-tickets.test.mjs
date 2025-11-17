import { describe, expect, it } from "vitest";
import { createJiraTicketSpecs } from "../create-jira-tickets.mjs";

describe("createJiraTicketSpecs", () => {
  it("creates ticket specs when isValid=true", async () => {
    const tickets = ["Ticket1", "Ticket2"];
    const specs = await createJiraTicketSpecs({
      project: "ENBL",
      epic: "EPIC1",
      reporter: "1",
      tickets,
      isValid: true,
    });
    expect(specs).toEqual([
      { project: "ENBL", epic: "EPIC1", title: "Ticket1", reporter: "1" },
      { project: "ENBL", epic: "EPIC1", title: "Ticket2", reporter: "1" },
    ]);
  });

  it("returns empty array when isValid=false", async () => {
    const specs = await createJiraTicketSpecs({
      project: "ENBL",
      epic: "EPIC1",
      reporter: "1",
      tickets: ["Ticket1"],
      isValid: false,
    });
    expect(specs).toEqual([]);
  });
});
