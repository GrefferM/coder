import { BROKEN_COLOR } from "../../../constants";
import type { ToolSource } from "../../../interfaces";
/** How many marks of one kind stand before the rest fold under its «+». */
export const ARMED_MARKS_EACH = 2;
/** A mini-sphere wears its source's colour, from a pale family apart from the agent and trouble colours. */
export const ARMED_SOURCE_COLORS = ["#b7c4e8", "#ddd0a6", "#a8cfd2"];
/** Declared commands are one source and take the first colour. */
export const ARMED_COMMANDS_COLOR = ARMED_SOURCE_COLORS[0];
/** All MCP servers share the second colour. */
export const ARMED_SERVERS_COLOR = ARMED_SOURCE_COLORS[1];
/** An agent granted as a tool wears a warm orange outside the pale family, so it reads as a sphere. */
export const ARMED_AGENTS_COLOR = "#e8934a";
/** A system command wears a lavender, outside the pale family and the trouble colours. */
export const ARMED_SYSTEM_COLOR = "#c9a7e8";
export const ARMED_SOURCE_COLOR: Record<ToolSource, string> = {
  command: ARMED_COMMANDS_COLOR,
  mcp: ARMED_SERVERS_COLOR,
  agent: ARMED_AGENTS_COLOR,
  system: ARMED_SYSTEM_COLOR,
};
/**
 * What got no place folds under its kind's «+», whose number counts marks: a command or a whole server that did not fit
 * is one each.
 */
export const ARMED_REST_PREFIX = "+";
/**
 * A source whose grants all point at nothing keeps its mark in the trouble tone; if it did not fit its kind's two
 * places, the tone goes to that kind's «+».
 */
export const ARMED_BROKEN_COLOR = BROKEN_COLOR;
