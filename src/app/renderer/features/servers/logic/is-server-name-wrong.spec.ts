import { describe, expect, it } from "vitest";
import { isServerNameWrong } from "./is-server-name-wrong";
import { SERVER_NAME_MAX_LENGTH } from "../../../../../contracts";

describe("isServerNameWrong", () => {
  it("takes the dash, because a server's name never reaches a model", () => {
    // The rule here is ours, not a provider's — `playwright-mcp` is the name on the box.
    expect(isServerNameWrong("playwright-mcp")).toBe(false);
    expect(isServerNameWrong("brave-search")).toBe(false);
    expect(isServerNameWrong("brave_search")).toBe(false);
    expect(isServerNameWrong("Brave2")).toBe(false);
  });

  it("refuses what cannot stand as a name at all", () => {
    expect(isServerNameWrong("сервер")).toBe(true);
    expect(isServerNameWrong("brave search")).toBe(true);
    expect(isServerNameWrong("pulls.create")).toBe(true);
  });

  it("refuses a name too long to stand in a list", () => {
    expect(isServerNameWrong("a".repeat(SERVER_NAME_MAX_LENGTH))).toBe(false);
    expect(isServerNameWrong("a".repeat(SERVER_NAME_MAX_LENGTH + 1))).toBe(true);
  });

  it("does not call an empty field wrong, since nothing is typed there yet", () => {
    // An empty required field is answered at the press, and not while somebody is still thinking.
    expect(isServerNameWrong("")).toBe(false);
  });
});
