import { describe, expect, it } from "vitest";
import { AGENT_COLORS } from "./agent-colors.constant";
import { STATE_STOP_COLOR } from "./agent-state.constant";
import { ARMED_SOURCE_COLORS } from "../../canvas";
import { LOST_PROVIDER_COLOR } from "../../../constants";

/** Three colour families that do not cross: agent colours, pale tool-source colours, and the red of states. */
describe("the three families of colour", () => {
  it("keeps a source's colour out of the palette an agent takes", () => {
    expect(ARMED_SOURCE_COLORS.filter((color) => AGENT_COLORS.includes(color))).toEqual([]);
  });

  it("keeps the red of a state out of both of them", () => {
    const trouble = [STATE_STOP_COLOR, LOST_PROVIDER_COLOR];

    expect(ARMED_SOURCE_COLORS.filter((color) => trouble.includes(color))).toEqual([]);
    expect(AGENT_COLORS.filter((color) => trouble.includes(color))).toEqual([]);
  });
});
