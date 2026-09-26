import type { BrokenPlaceKind } from "../../../contracts";

/** Which list in a project holds which kind of named thing — the walk names a step by the list it went down. */
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

/** Said as the broken rule where the validator named a field but no constraint the screen can read. */
export const BROKEN_RULE_UNKNOWN = "invalid";
