import {
  FIRST_LEVEL_TEXT_COLOR,
  PANEL_GROUND_COLOR,
  QUIET_MARK_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
} from "../../../../../constants";

/** The file changed under a standing draft; nothing is chosen automatically. */
export const FILE_CONFLICT_QUESTION = "Файл змінився, а у вас є незбережене";
export const FILE_CONFLICT_NOTE = "Хтось перемкнув гілку — project.yaml на диску вже інший. Ваші зміни ще не записані.";
export const FILE_CONFLICT_MINE_LABEL = "У ВАС НА ЕКРАНІ";
export const FILE_CONFLICT_DISK_LABEL = "НА ДИСКУ";
export const FILE_CONFLICT_KEEP_LABEL = "Лишити моє";
export const FILE_CONFLICT_TAKE_LABEL = "Взяти з диска";
export const FILE_CONFLICT_KEEP_NOTE =
  "«Лишити моє» не пише у файл одразу — воно лише знімає питання; запис станеться, коли ви збережете самі";
export const FILE_CONFLICT_NOTHING_LABEL = "нічого";

export const FILE_CONFLICT_COLUMNS_GAP_PX = 12;
export const FILE_CONFLICT_COLUMN_GAP_PX = 6;
export const FILE_CONFLICT_COLUMN_PADDING = "10px 11px";
export const FILE_CONFLICT_COLUMN_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const FILE_CONFLICT_COLUMN_BORDER_RADIUS_PX = 8;
export const FILE_CONFLICT_LABEL_COLOR = QUIET_MARK_COLOR;
export const FILE_CONFLICT_LINE_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const FILE_CONFLICT_LINE_FONT_SIZE_PX = 11;
export const FILE_CONFLICT_NOTE_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const FILE_CONFLICT_NOTE_FONT_SIZE_PX = 11;
export const FILE_CONFLICT_NOTE_LINE_HEIGHT = 1.5;
