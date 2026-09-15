import type { McpSecretsHeld } from "../../../interfaces";

/**
 * A machine that could not be asked holds nothing, as far as a screen is concerned. It is not
 * a claim that nothing was ever typed in — it is the only honest thing to draw when the answer never came.
 */
export const NOTHING_HELD: McpSecretsHeld = {
  token: null,
  env: {},
};
