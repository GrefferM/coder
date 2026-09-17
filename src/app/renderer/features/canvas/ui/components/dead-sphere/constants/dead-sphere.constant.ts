import { FALLEN_COLOR, QUIET_MARK_COLOR } from "../../../../../../constants";
import {
  CANVAS_DEAD_ID_LENGTH,
  CANVAS_TROUBLE_BACKGROUND_COLOR,
  CANVAS_TROUBLE_BORDER_COLOR,
} from "../../../../constants";

/** The ring: dashed, because the wireframe is the thing itself and here the thing is gone. */
export const DEAD_SPHERE_BORDER = "1.5px dashed #3a4258";
export const DEAD_SPHERE_GLOW = "radial-gradient(circle, rgba(58, 66, 88, 0.14) 0%, transparent 70%)";

/** Under the ring: the id from the line where a name would be, and the one word about it. */
export const DEAD_SPHERE_GAP_PX = 7;
export const DEAD_SPHERE_ID_COLOR = QUIET_MARK_COLOR;
export const DEAD_SPHERE_ID_FONT_SIZE_PX = 11;
export const DEAD_SPHERE_ID_LETTER_SPACING_PX = 2;
export const DEAD_SPHERE_ID_LENGTH = CANVAS_DEAD_ID_LENGTH;

export const DEAD_SPHERE_NOTE_LABEL = "НЕМА КОГО КЛИКАТИ";
export const DEAD_SPHERE_NOTE_COLOR = FALLEN_COLOR;
export const DEAD_SPHERE_NOTE_BACKGROUND_COLOR = CANVAS_TROUBLE_BACKGROUND_COLOR;
export const DEAD_SPHERE_NOTE_BORDER = `1px dashed ${CANVAS_TROUBLE_BORDER_COLOR}`;
export const DEAD_SPHERE_NOTE_BORDER_RADIUS_PX = 6;
export const DEAD_SPHERE_NOTE_PADDING = "2px 8px";
export const DEAD_SPHERE_NOTE_FONT_SIZE_PX = 9;
export const DEAD_SPHERE_NOTE_LETTER_SPACING_PX = 1.5;
