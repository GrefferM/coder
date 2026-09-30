import { BORDER_AT_REST_COLOR, SECOND_LEVEL_TEXT_COLOR } from "../../../../../../../../../constants";

/** Body column: function, pinned list, open list, schema. */
export const GRANT_VIEW_BODY_PADDING_PX = 16;
export const GRANT_VIEW_BODY_GAP_PX = 16;
export const GRANT_VIEW_TITLE_GAP_PX = 5;
export const GRANT_VIEW_TITLE_COLOR = "#e6e9f2";
export const GRANT_VIEW_TITLE_FONT_SIZE_PX = 13.5;
export const GRANT_VIEW_DESCRIPTION_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const GRANT_VIEW_DESCRIPTION_FONT_SIZE_PX = 12;
export const GRANT_VIEW_DESCRIPTION_LINE_HEIGHT = 1.5;

/** The pinned and open lists, each under its heading. */
export const GRANT_VIEW_BLOCK_GAP_PX = 8;
export const GRANT_VIEW_BLOCK_HEAD_GAP_PX = 7;
export const GRANT_VIEW_BLOCK_ICON_SIZE_PX = 11;
export const GRANT_VIEW_BLOCK_LABEL_FONT_SIZE_PX = 11;
export const GRANT_VIEW_BLOCK_LABEL_LETTER_SPACING_PX = 1.15;
export const GRANT_VIEW_BOX_GAP_PX = 6;
export const GRANT_VIEW_BOX_PADDING_PX = 11;
export const GRANT_VIEW_BOX_BORDER_RADIUS_PX = 10;

/** «ЗАКРІПЛЕНО ЗА …» — accent side: closed lock, tinted box. */
export const GRANT_VIEW_PINNED_LABEL = "ЗАКРІПЛЕНО ЗА";
export const GRANT_VIEW_PINNED_BACKGROUND_COLOR = "rgba(56, 163, 255, 0.06)";
export const GRANT_VIEW_PINNED_BORDER_COLOR = "#2c3550";
export const GRANT_VIEW_PINNED_NOTE = "Модель цих значень не бачить і змінити не може";

/** «ВИРІШУЄ МОДЕЛЬ» — muted side: open lock, dashed edge. */
export const GRANT_VIEW_OPEN_LABEL = "ВИРІШУЄ МОДЕЛЬ";
export const GRANT_VIEW_OPEN_LABEL_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const GRANT_VIEW_OPEN_BORDER_COLOR = BORDER_AT_REST_COLOR;

export const GRANT_VIEW_SAVE_LABEL = "Зберегти";
export const GRANT_VIEW_FOOTER_PADDING_PX = 16;
export const GRANT_VIEW_FOOTER_GAP_PX = 10;

/** Shown instead of the description when the source command is gone. */
export const GRANT_VIEW_LOST_NOTE = "Команди, з якої зроблено видачу, у проєкті немає";
