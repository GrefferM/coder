import { describe, expect, it } from "vitest";
import { deleteServerNote } from "./delete-server-note";

describe("deleteServerNote", () => {
  it("names the grants and what leaves this machine, in one sentence", () => {
    expect(
      deleteServerNote("playwright-mcp", {
        grants: 12,
        agents: 1,
        hasToken: true,
        values: 2,
      }),
    ).toBe(
      "Заберемо сервер playwright-mcp, 12 його функцій в 1 агента і токен і значення 2 змінних із ключника цієї машини.",
    );
  });

  it("says nothing of a burden that is not there, rather than counting a zero", () => {
    // The project-file row is never named either: every deed changes it, so it is not news.
    expect(
      deleteServerNote("brave_search", {
        grants: 0,
        agents: 0,
        hasToken: false,
        values: 0,
      }),
    ).toBe("Заберемо сервер brave_search.");
  });

  it("names only the keys where nobody was granted anything", () => {
    expect(
      deleteServerNote("brave_search", {
        grants: 0,
        agents: 0,
        hasToken: false,
        values: 1,
      }),
    ).toBe("Заберемо сервер brave_search, значення 1 змінної із ключника цієї машини.");
  });

  it("names only the grants where this machine holds nothing", () => {
    expect(
      deleteServerNote("notion-mcp", {
        grants: 3,
        agents: 2,
        hasToken: false,
        values: 0,
      }),
    ).toBe("Заберемо сервер notion-mcp, 3 його функції в 2 агентів.");
  });
});
