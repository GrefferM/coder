import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { leadsBack } from "./leads-back";
import { aConfig, aLink } from "../../../utils/testing";
import type { ProjectConfig } from "../../../contracts";

/** The project as only its lines. */
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
    assert.equal(leadsBack(linked([]), "agent-1", "agent-1"), true);
  });

  it("says a line comes back when the other agent already feeds this one", () => {
    assert.equal(leadsBack(linked([["agent-2", "agent-1"]]), "agent-1", "agent-2"), true);
  });

  it("follows the lines further along, so a ring of three is a ring", () => {
    // The ring need not be adjacent: work handed down two lines still arrives where it started.
    assert.equal(
      leadsBack(
        linked([
          ["agent-2", "agent-3"],
          ["agent-3", "agent-1"],
        ]),
        "agent-1",
        "agent-2",
      ),
      true,
    );
  });

  it("lets a line stand when nothing ahead of it comes back", () => {
    assert.equal(
      leadsBack(
        linked([
          ["agent-2", "agent-3"],
          ["agent-3", "agent-4"],
        ]),
        "agent-1",
        "agent-2",
      ),
      false,
    );
  });

  it("answers «ні» about a ring that does not hold this agent, instead of walking it for ever", () => {
    // The two agents ahead feed each other; the walked set keeps the question from recursing forever.
    assert.equal(
      leadsBack(
        linked([
          ["agent-2", "agent-3"],
          ["agent-3", "agent-2"],
        ]),
        "agent-1",
        "agent-2",
      ),
      false,
    );
  });

  it("looks down every line out of an agent, not only the first", () => {
    assert.equal(
      leadsBack(
        linked([
          ["agent-2", "agent-3"],
          ["agent-2", "agent-4"],
          ["agent-4", "agent-1"],
        ]),
        "agent-1",
        "agent-2",
      ),
      true,
    );
  });

  it("says nothing comes back in a project that has no lines at all", () => {
    assert.equal(leadsBack(aConfig(), "agent-1", "agent-2"), false);
  });
});
