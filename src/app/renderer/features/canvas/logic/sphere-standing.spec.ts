import { describe, expect, it } from "vitest";
import { sphereStanding } from "./sphere-standing";
import type { Agent, Link } from "../../../interfaces";
import type { CanvasPicked } from "../interfaces";
import { aLink, anAgent } from "../../../testing";

function agent(id: string): Agent {
  return anAgent({
    id,
    name: id.toUpperCase(),
    color: "#b18aff",
    x: 0,
    y: 0,
    maxCalls: 10,
    temperature: 0.3,
  });
}

function picked(patch: Partial<CanvasPicked> = {}): CanvasPicked {
  return {
    selectedAgentId: null,
    aimedAgentId: null,
    isPanelOnAgent: false,
    pending: null,
    dimmedModelId: null,
    doomedAgentId: null,
    pasted: null,
    isPasteOffered: false,
    ...patch,
  };
}

const LINKS: Link[] = [
  aLink({
    from: "editor",
    to: "linter",
  }),
];

describe("sphereStanding", () => {
  it("picks out the selected sphere and aims at the chat's own", () => {
    const standing = sphereStanding(
      agent("editor"),
      picked({
        selectedAgentId: "editor",
      }),
      null,
      false,
      LINKS,
    );

    expect(standing.isSelected).toBe(true);
    expect(standing.isDimmed).toBe(false);
  });

  it("stands the rest back while the panel is about a selected agent", () => {
    // The panel is about one agent, and the canvas says which by standing the others back.
    const standing = sphereStanding(
      agent("linter"),
      picked({
        selectedAgentId: "editor",
        isPanelOnAgent: true,
      }),
      null,
      false,
      LINKS,
    );

    expect(standing.isDimmed).toBe(true);
    expect(standing.isSelected).toBe(false);
  });

  it("stands everything back while a link is chosen: the act belongs to the link", () => {
    // Choosing a link closes the panel, and the canvas is about that link until it is let go.
    expect(sphereStanding(agent("editor"), picked(), null, true, LINKS).isDimmed).toBe(true);
  });

  it("says nothing of the aim while a line is being drawn: a line is a moment, an aim stands for hours", () => {
    // Everything is about the line — where it comes from, and where it may not land.
    const standing = sphereStanding(
      agent("editor"),
      picked({
        aimedAgentId: "editor",
      }),
      "editor",
      false,
      LINKS,
    );

    expect(standing.isSelected).toBe(true);
    expect(standing.isAimed).toBe(false);
  });

  it("stands back every sphere the line must not land on", () => {
    // A line that closes a ring or repeats one already drawn takes no drop.
    expect(sphereStanding(agent("linter"), picked(), "editor", false, LINKS).isDimmed).toBe(true);
    expect(sphereStanding(agent("reviewer"), picked(), "editor", false, LINKS).isDimmed).toBe(false);
  });
});
