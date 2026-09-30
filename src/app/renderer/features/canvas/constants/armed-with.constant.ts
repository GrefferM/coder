import { BROKEN_COLOR } from "../../../constants";
import type { ToolSource } from "../../../interfaces";
/**
 * How many marks of one порода stand before the rest of them fold under its «+». Nine places on
 * the arc, split evenly rather than by number: two commands and their «+», two servers and their «+», two agents
 * and their «+». Twenty dots around a sphere read as noise rather than as arming, and the question the canvas
 * answers is «what does this agent work with», not «which twenty».
 */
export const ARMED_MARKS_EACH = 2;
/**
 * The colour of a mini-sphere is its **source's**, not the agent's — so four tools coming from two
 * different places are seen at a glance.
 *
 * Sources have a family of their own: pale and barely coloured, and it crosses neither of the other two. Not the
 * five an agent takes (`AGENT_COLORS`), because on an agent of the same colour the rule «the source's, not the
 * agent's» would be saying nothing; and not the trouble family (`FALLEN_COLOR`, `BROKEN_COLOR`), because a
 * mini-sphere at rest would stand one step from the colour it wears when it is broken. `armed-with.spec` holds
 * the app to it.
 */
export const ARMED_SOURCE_COLORS = ["#b7c4e8", "#ddd0a6", "#a8cfd2"];
/** Declared commands are one source and take the first of the family; a server takes one of the rest. */
export const ARMED_COMMANDS_COLOR = ARMED_SOURCE_COLORS[0];
/** Every MCP server shares the second colour: the arc says «this agent works with servers», not which one. */
export const ARMED_SERVERS_COLOR = ARMED_SOURCE_COLORS[1];
/** An agent granted as a tool wears a warm orange outside the pale family, so it reads as a sphere at a glance. */
export const ARMED_AGENTS_COLOR = "#e8934a";
/** Each kind of source's colour. */
export const ARMED_SOURCE_COLOR: Record<ToolSource, string> = {
  command: ARMED_COMMANDS_COLOR,
  mcp: ARMED_SERVERS_COLOR,
  agent: ARMED_AGENTS_COLOR,
};
/**
 * What got no place folds under its own порода's «+», and the number on it counts marks — a command
 * that did not fit is one, and a whole server that did not fit is one as well. There is no grey «+» any more: two
 * identical grey ones side by side would have read as a single heap.
 */
export const ARMED_REST_PREFIX = "+";
/**
 * A source whose grants **all** point at nothing keeps its mark and takes the trouble tone: «видавали, і воно
 * пропало» is worth a mark of its own. Where that source did not fit its порода's two places, the tone goes to
 * that порода's «+» instead, and the order on the arc does not move.
 *
 * The colour is the trouble family's and not a source's, so it never reads as one more порода.
 */
export const ARMED_BROKEN_COLOR = BROKEN_COLOR;
