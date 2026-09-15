import { describe, expect, it } from "vitest";
import { leadsBack } from "./leads-back";
import { aConfig, aLink } from "../../../testing";
import type { ProjectConfig } from "../../../interfaces";

/** The project as nothing but its lines, which is all this question is about. */
function linked(pairs: [string, string][]): ProjectConfig {
  return aConfig({
    links: pairs.map(([from, to], index) =>
      aLink({
        id: `link-${index + 1}`,
        from,
        to,
      }),
    ),
  });
}

describe("leadsBack", () => {
  it("says a line drawn into the agent itself comes back where it came from", () => {
    expect(leadsBack(linked([]), "agent-1", "agent-1")).toBe(true);
  });

  it("says a line comes back when the other agent already feeds this one", () => {
    expect(leadsBack(linked([["agent-2", "agent-1"]]), "agent-1", "agent-2")).toBe(true);
  });

  it("follows the lines further along, so a ring of three is a ring", () => {
    // The ring need not be next door — work handed down two lines still arrives where it started.
    expect(
      leadsBack(
        linked([
          ["agent-2", "agent-3"],
          ["agent-3", "agent-1"],
        ]),
        "agent-1",
        "agent-2",
      ),
    ).toBe(true);
  });

  it("lets a line stand when nothing ahead of it comes back", () => {
    expect(
      leadsBack(
        linked([
          ["agent-2", "agent-3"],
          ["agent-3", "agent-4"],
        ]),
        "agent-1",
        "agent-2",
      ),
    ).toBe(false);
  });

  it("answers «ні» about a ring that does not hold this agent, instead of walking it for ever", () => {
    // The two agents ahead feed each other. Without the walked set the question would never come back with an answer.
    expect(
      leadsBack(
        linked([
          ["agent-2", "agent-3"],
          ["agent-3", "agent-2"],
        ]),
        "agent-1",
        "agent-2",
      ),
    ).toBe(false);
  });

  it("looks down every line out of an agent, not only the first", () => {
    expect(
      leadsBack(
        linked([
          ["agent-2", "agent-3"],
          ["agent-2", "agent-4"],
          ["agent-4", "agent-1"],
        ]),
        "agent-1",
        "agent-2",
      ),
    ).toBe(true);
  });

  it("says nothing comes back in a project that has no lines at all", () => {
    expect(leadsBack(aConfig(), "agent-1", "agent-2")).toBe(false);
  });
});
