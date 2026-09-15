/**
 * A skeleton stands in for a lost part file only where the thing is a node of the graph — an agent whose sphere
 * the links are drawn to. What a catalogue holds is left out instead, and whatever pointed at it says so.
 */
export const UNKNOWN_VALUE = "unknown";

/**
 * How far apart restored agents stand. Where an agent's own file is gone its place is gone with it, so the canvas is
 * given a row instead of one point: a step wider than a sphere, and two of them never sit on one another.
 */
export const AGENT_SKELETON_STEP_PX = 240;

export const AGENT_SKELETON = {
  name: UNKNOWN_VALUE,
  // A colour cannot say «unknown»; a lost one becomes this grey.
  color: "#6b7490",
  isActive: true,
  x: 0,
  y: 0,
  // A number nobody wrote is not a number; the agent says «НЕ ЗАПОВНЕНО» instead of standing on a fill-in.
  maxCalls: null,
  temperature: null,
};
