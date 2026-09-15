import { describe, expect, it } from "vitest";
import { AGENT_COLORS } from "./agent-colors.constant";
import { STATE_STOP_COLOR } from "./agent-state.constant";
import { ARMED_SOURCE_COLORS } from "../../canvas";
import { LOST_PROVIDER_COLOR } from "../../../constants";

/**
 * The app paints with three families and they do not cross — the five an agent takes, the pale ones a tool's
 * source takes, and the red one that belongs to states alone. The rule is held here because this is the one
 * place that may look at all three.
 */
describe("the three families of colour", () => {
  it("keeps a source's colour out of the palette an agent takes", () => {
    // On an agent of the same colour, «the colour is the source's, not the agent's» would be saying nothing.
    expect(ARMED_SOURCE_COLORS.filter((color) => AGENT_COLORS.includes(color))).toEqual([]);
  });

  it("keeps the red of a state out of both of them", () => {
    // A mini-sphere at rest must not stand a step from the colour it wears when it is broken.
    const trouble = [STATE_STOP_COLOR, LOST_PROVIDER_COLOR];

    expect(ARMED_SOURCE_COLORS.filter((color) => trouble.includes(color))).toEqual([]);
    expect(AGENT_COLORS.filter((color) => trouble.includes(color))).toEqual([]);
  });
});
