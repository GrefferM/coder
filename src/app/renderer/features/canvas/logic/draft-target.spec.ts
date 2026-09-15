import { describe, expect, it } from "vitest";
import { draftTarget } from "./draft-target";
import { SPHERE_SIZE_PX } from "../../../components/sphere/constants";
import type { Agent } from "../../../interfaces";
import { anAgent } from "../../../testing";

function agent(id: string, x: number, y: number): Agent {
  return anAgent({
    id,
    name: id.toUpperCase(),
    color: "#b18aff",
    x,
    y,
    maxCalls: 10,
    temperature: 0.3,
  });
}

const AGENTS = [agent("editor", 0, 0), agent("linter", 400, 400)];

describe("draftTarget", () => {
  it("takes the sphere the line is over", () => {
    // The end the line would take if it were let go now.
    expect(
      draftTarget(AGENTS, "editor", {
        x: 400,
        y: 400,
      })?.id,
    ).toBe("linter");
  });

  it("takes nothing where the line is merely near a sphere", () => {
    expect(
      draftTarget(AGENTS, "editor", {
        x: 400 + SPHERE_SIZE_PX,
        y: 400,
      }),
    ).toBeNull();
  });

  it("never takes the sphere the line comes from", () => {
    // A line to itself is not a line, so its own sphere is no end for it.
    expect(
      draftTarget(AGENTS, "editor", {
        x: 0,
        y: 0,
      }),
    ).toBeNull();
  });
});
