import { describe, expect, it } from "vitest";
import { deletedAgentNote } from "./deleted-agent-note";

describe("deletedAgentNote", () => {
  it("says an agent tied to nobody leaves nobody behind", () => {
    expect(deletedAgentNote("DOCS", [])).toBe("Заберемо сферу DOCS. Вона ні з ким не зв'язана.");
  });

  it("names the one neighbour left, in the singular", () => {
    expect(deletedAgentNote("EDITOR", ["PLANNER"])).toBe(
      "Заберемо сферу EDITOR і її зв'язки. PLANNER лишиться сам по собі.",
    );
  });

  it("joins two with і", () => {
    expect(deletedAgentNote("EDITOR", ["PLANNER", "REVIEWER"])).toBe(
      "Заберемо сферу EDITOR і її зв'язки. PLANNER і REVIEWER лишаться, кожен сам по собі.",
    );
  });

  it("commas everyone before the last one", () => {
    expect(deletedAgentNote("EDITOR", ["A", "B", "C"])).toBe(
      "Заберемо сферу EDITOR і її зв'язки. A, B і C лишаться, кожен сам по собі.",
    );
  });

  it("names the sphere the question is about, whichever half it says", () => {
    // The thing is named in both halves of «Заберемо ‹річ›. ‹Що піде або лишиться разом›.»
    expect(deletedAgentNote("DOCS", [])).toContain("DOCS");
    expect(deletedAgentNote("DOCS", ["PLANNER"])).toContain("DOCS");
  });
});
