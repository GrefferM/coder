import { BORDER_AT_REST_COLOR, BROKEN_COLOR, CONTROL_AT_REST_COLOR, PANEL_GROUND_COLOR } from "../../../constants";

/**
 * The two pills a run's sphere can wear: solid means the agent exists in the project under another name, dashed means
 * the project does not have it at all.
 */
export const STANDING_RENAMED_LABEL = "ПЕРЕЙМЕНОВАНИЙ";
export const STANDING_WAS_PREFIX = "У ЗАПИСІ ";
export const STANDING_GONE_LABEL = "ВИДАЛЕНИЙ";
export const STANDING_PILL_SEPARATOR = " · ";
export const STANDING_PILL_GAP_PX = 5;
export const STANDING_PILL_RISE_PX = 5;
export const STANDING_PILL_PADDING = "2px 8px";
export const STANDING_PILL_BORDER_RADIUS_PX = 6;
export const STANDING_PILL_BACKGROUND_COLOR = "#171b26";
export const STANDING_PILL_FONT_SIZE_PX = 9;
export const STANDING_PILL_LETTER_SPACING_PX = 1;
export const STANDING_PILL_ICON_SIZE_PX = 9;
/** Solid border in the quiet mark's colour: the agent still exists in the project. */
export const STANDING_RENAMED_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const STANDING_RENAMED_COLOR = CONTROL_AT_REST_COLOR;
/** Dashed, pink: the project does not have this agent, and pressing the sphere leads nowhere. */
export const STANDING_GONE_BORDER_COLOR = "#3a2a30";
export const STANDING_GONE_COLOR = BROKEN_COLOR;

/**
 * Band over the projection marking which half of the screen is «then» and which is «now»; shown only when an agent of
 * the pass was renamed or is gone.
 */
export const STANDING_BAND_LABEL = "ОБСТАВИНИ — НА МОМЕНТ ЗАПУСКУ · ІМЕНА — СЬОГОДНІШНІ";
export const STANDING_BAND_GAP_PX = 6;
export const STANDING_BAND_PADDING = "3px 9px";
export const STANDING_BAND_BORDER_RADIUS_PX = 7;
export const STANDING_BAND_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const STANDING_BAND_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const STANDING_BAND_COLOR = STANDING_RENAMED_COLOR;
export const STANDING_BAND_FONT_SIZE_PX = 9;
export const STANDING_BAND_LETTER_SPACING_PX = 1.5;
export const STANDING_BAND_ICON_SIZE_PX = 10;

/**
 * Card under the graph listing each agent whose circumstances or name changed since the run, «тоді» against «зараз»;
 * absent when nothing changed.
 */
export const STANDING_CHANGES_LABEL = "ЩО ЗМІНИЛОСЯ ВІД ТОГО ДНЯ";
export const STANDING_CHANGES_THEN_LABEL = "тоді";
export const STANDING_CHANGES_NOW_LABEL = "зараз";
export const STANDING_CHANGES_GONE_LABEL = "агента видалено";
export const STANDING_CHANGES_TEMPERATURE_PREFIX = "темп. ";
export const STANDING_CHANGES_TEMPERATURE_DECIMALS = 1;
export const STANDING_CHANGES_SEPARATOR = " · ";
export const STANDING_CHANGES_GAP_PX = 12;
export const STANDING_CHANGES_ROW_GAP_PX = 14;
export const STANDING_CHANGES_PADDING = "16px";
export const STANDING_CHANGES_BORDER_RADIUS_PX = 10;
export const STANDING_CHANGES_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const STANDING_CHANGES_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const STANDING_CHANGES_LABEL_COLOR = "#4a5164";
export const STANDING_CHANGES_LABEL_FONT_SIZE_PX = 9;
export const STANDING_CHANGES_LABEL_LETTER_SPACING_PX = 1.5;
export const STANDING_CHANGES_CARD_GAP_PX = 10;
export const STANDING_CHANGES_CARD_PADDING = "12px";
export const STANDING_CHANGES_CARD_BORDER_RADIUS_PX = 9;
export const STANDING_CHANGES_CARD_BACKGROUND_COLOR = "#171b26";
export const STANDING_CHANGES_NAME_FONT_SIZE_PX = 10;
export const STANDING_CHANGES_NAME_GAP_PX = 8;
export const STANDING_CHANGES_LINE_GAP_PX = 5;
export const STANDING_CHANGES_LINE_FONT_SIZE_PX = 10.5;
export const STANDING_CHANGES_LINE_COLOR = CONTROL_AT_REST_COLOR;
export const STANDING_CHANGES_WHEN_GAP_PX = 6;
