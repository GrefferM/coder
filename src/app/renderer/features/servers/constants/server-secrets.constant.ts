import type { McpSecretsHeld } from "../../../interfaces";

/**
 * A machine that could not be asked: it holds nothing as far as the screen knows, which does not claim that nothing was
 * typed.
 */
export const NOTHING_HELD: McpSecretsHeld = {
  token: null,
  env: {},
};
