import type { BrokenGrantCause } from "../../../../../../../../../interfaces";

/**
 * One sentence per reason — the rows are the same, and only the sentence says which hole this
 * is. The server that is gone is named by nothing here: the project held its name in the server's own file, and
 * that file went with it, so the sentence says «сервера» and not which one.
 */
export const LOST_GRANTS_NOTES: Record<BrokenGrantCause, string> = {
  command: "Команди більше немає у проєкті. Видача лишилась — агент кличе те, чого немає.",
  goneFunction: "Сервер оновився й забрав цю функцію. Видача лишилась — агент кличе те, чого немає.",
  goneServer: "Сервера більше немає у проєкті. Видача лишилась — агент кличе те, чого немає.",
};

/** One act for the whole group, and it says how much it takes away where that is more than one. */
export const LOST_GRANTS_REMOVE_LABEL = "ПРИБРАТИ ВИДАЧУ";

/** The lock and its pinned-argument count, carried by a grant that outlived its command. */
export const LOST_GRANTS_PINNED_BACKGROUND_COLOR = "#241519";
export const LOST_GRANTS_PINNED_GAP_PX = 4;
export const LOST_GRANTS_PINNED_ICON_SIZE_PX = 8;

/** The server a row's function came from, said to the right of the name. */
export const LOST_GRANTS_SOURCE_FONT_SIZE_PX = 9;
export const LOST_GRANTS_SOURCE_LETTER_SPACING_PX = 1;
