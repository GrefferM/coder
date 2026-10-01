/** A skeleton stands in for a lost part file only for graph nodes (agents); catalogue items are left out. */
export const UNKNOWN_VALUE = "unknown";

/** Spacing between restored agents: a step wider than a sphere, so none overlap. */
export const AGENT_SKELETON_STEP_PX = 240;

export const AGENT_SKELETON = {
  name: UNKNOWN_VALUE,
  purpose: null,
  // A colour cannot say «unknown»; a lost one becomes this grey.
  color: "#6b7490",
  isActive: true,
  // Safe default when the lost file says nothing.
  waitsForAll: true,
  memory: "own",
  x: 0,
  y: 0,
  // Unset; the agent shows «НЕ ЗАПОВНЕНО».
  maxCalls: null,
  temperature: null,
};
