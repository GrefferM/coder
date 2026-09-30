import type { BrokenPlaceKind } from "../../../contracts";

/** Which project list holds which kind of named thing. */
export const BROKEN_PLACE_KINDS: Record<string, BrokenPlaceKind> = {
  models: "model",
  prompts: "prompt",
  commands: "command",
  parameters: "parameter",
  servers: "server",
  agents: "agent",
  tools: "grant",
  links: "link",
};

/** Broken rule reported where the validator named a field but no constraint the screen can read. */
export const BROKEN_RULE_UNKNOWN = "invalid";
