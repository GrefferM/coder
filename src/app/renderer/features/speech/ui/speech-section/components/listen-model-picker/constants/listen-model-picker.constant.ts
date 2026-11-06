import { INTERACTION_ACCENT_COLOR, SECOND_LEVEL_TEXT_COLOR } from "../../../../../../../constants";
import type { IconTone } from "../../../../../../../components";

/** The hearing model's field (38c), and what stands under it when the catalogue has nothing to offer. */
export const LISTEN_MODEL_GAP_PX = 6;
export const LISTEN_MODEL_NONE_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const LISTEN_MODEL_NONE_ACT_TONE: IconTone = {
  rest: INTERACTION_ACCENT_COLOR,
  lit: "#7cc4ff",
};
