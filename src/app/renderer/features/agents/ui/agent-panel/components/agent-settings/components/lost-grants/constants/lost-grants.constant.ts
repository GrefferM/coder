import type { BrokenGrantCause } from "../../../../../../../../../interfaces";

/** One sentence per reason; a gone server is not named, only «сервера», as its name went with its file. */
export const LOST_GRANTS_NOTES: Record<BrokenGrantCause, string> = {
  command: "Команди більше немає у проєкті. Видача лишилась — агент кличе те, чого немає.",
  goneFunction: "На сервері немає функції з такою назвою. Видача лишилась — агент кличе те, чого немає.",
  goneServer: "Сервера більше немає у проєкті. Видача лишилась — агент кличе те, чого немає.",
  goneAgent: "Агента більше немає у проєкті. Видача лишилась — агент кличе те, чого немає.",
};

/** One act removes the whole group, stating the count when more than one. */
export const LOST_GRANTS_REMOVE_LABEL = "ПРИБРАТИ ВИДАЧУ";

/** The lock and pinned-argument count on a grant whose command is gone. */
export const LOST_GRANTS_PINNED_BACKGROUND_COLOR = "#241519";
export const LOST_GRANTS_PINNED_GAP_PX = 4;
export const LOST_GRANTS_PINNED_ICON_SIZE_PX = 8;

/** The server a row's function came from, right of the name. */
export const LOST_GRANTS_SOURCE_FONT_SIZE_PX = 9;
export const LOST_GRANTS_SOURCE_LETTER_SPACING_PX = 1;
