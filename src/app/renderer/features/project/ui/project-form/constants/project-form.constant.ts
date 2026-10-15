import { FIRST_LEVEL_TEXT_COLOR, PANEL_GROUND_COLOR, SECOND_LEVEL_TEXT_COLOR } from "../../../../../constants";
import type { AppearingPart } from "../interfaces";

export const PROJECT_FORM_TITLE = "Новий проєкт";
export const PROJECT_FORM_DIRECTORY_LABEL = "ПАПКА";
export const PROJECT_FORM_CHOOSE_LABEL = "Обрати";
export const PROJECT_FORM_NAME_LABEL = "НАЗВА ПРОЄКТУ";
export const PROJECT_FORM_NAME_NOTE = "Підставлена з імені папки — можна змінити";

/** What will appear in an empty folder. */
export const PROJECT_FORM_WILL_APPEAR_LABEL = "З'ЯВИТЬСЯ В ПАПЦІ";

/**
 * Everything a project is on disk, in the rail's order. Folders appear only once there is something to put in them,
 * hence «З'ЯВИТЬСЯ» and not «є».
 */
export const PROJECT_FORM_APPEARING: AppearingPart[] = [
  {
    name: "project.yaml",
    note: null,
  },
  {
    name: "agents/",
    note: "по файлу на агента",
  },
  {
    name: "models/",
    note: "по файлу на модель",
  },
  {
    name: "servers/",
    note: "по файлу на сервер",
  },
  {
    name: "commands/",
    note: "по файлу на команду",
  },
  {
    name: "prompts/",
    note: "тіло кожного промпта окремим .md",
  },
];
export const PROJECT_FORM_PLACE_NOTE = "Прямо в теці, без крапки на початку — видно у Finder і в діалогах відкриття";

export const PROJECT_FORM_CANCEL_LABEL = "Скасувати";
export const PROJECT_FORM_CREATE_LABEL = "Створити";

export const PROJECT_FORM_WIDTH_PX = 520;
export const PROJECT_FORM_GAP_PX = 16;
export const PROJECT_FORM_TITLE_FONT_SIZE_PX = 17;
export const PROJECT_FORM_TITLE_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const PROJECT_FORM_BLOCK_PADDING = "12px 14px";
export const PROJECT_FORM_BLOCK_GAP_PX = 8;
export const PROJECT_FORM_BLOCK_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const PROJECT_FORM_BLOCK_BORDER_COLOR = "#1c202c";
export const PROJECT_FORM_BLOCK_BORDER_RADIUS_PX = 10;
export const PROJECT_FORM_FILE_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const PROJECT_FORM_FILE_FONT_SIZE_PX = 12;
export const PROJECT_FORM_QUIET_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const PROJECT_FORM_QUIET_FONT_SIZE_PX = 10;
export const PROJECT_FORM_ACTIONS_GAP_PX = 8;
export const PROJECT_FORM_DIRECTORY_GAP_PX = 10;
