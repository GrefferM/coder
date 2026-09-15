import { describe, expect, it } from "vitest";
import { agentDraft } from "./agent-draft";
import type { Agent } from "../../../interfaces";
import { anAgent } from "../../../testing";

const AGENT: Agent = anAgent({
  name: "ТЕЗАР",
  promptId: "prompt-1",
  color: "#b18aff",
  x: 320,
  y: 480,
});

describe("agentDraft", () => {
  it("leaves out the id and the place on the canvas, which the settings tab does not hold", () => {
    const draft = agentDraft(AGENT, null);

    expect(draft).not.toHaveProperty("id");
    expect(draft).not.toHaveProperty("x");
    expect(draft).not.toHaveProperty("y");
    expect(draft.name).toBe("ТЕЗАР");
  });

  it("lays the edits over what was saved, field by field", () => {
    const draft = agentDraft(AGENT, {
      name: "СТИСЛЯР",
    });

    expect(draft.name).toBe("СТИСЛЯР");
    // Everything the person has not touched still says what the record says.
    expect(draft.color).toBe("#b18aff");
    expect(draft.promptId).toBe("prompt-1");
  });

  it("gives back what was saved where nothing is edited", () => {
    expect(agentDraft(AGENT, null)).toEqual(agentDraft(AGENT, {}));
  });
});
