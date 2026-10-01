import type { AgentMemory } from "../../../../../../../../../interfaces";

/** The section's head, the way «КОМАНДИ» and «АГЕНТИ» head theirs. */
export const MEMORY_SECTION_LABEL = "ПАМ'ЯТЬ";
export const MEMORY_SECTION_GAP_PX = 8;

/** The three memories, in the order the track shows them. */
export const MEMORY_SECTION_OPTIONS: { value: AgentMemory; label: string }[] = [
  {
    value: "own",
    label: "Своя",
  },
  {
    value: "none",
    label: "Вимкнено",
  },
  {
    value: "shared",
    label: "Загальна",
  },
];

/** The line under the track, for the chosen memory. */
export const MEMORY_SECTION_HINTS: Record<AgentMemory, string> = {
  own: "БАЧИТЬ СВОЇ МИНУЛІ КРОКИ В ЦІЙ РОЗМОВІ",
  none: "КОЖНЕ ЗАВДАННЯ З НУЛЯ",
  shared: "БАЧИТЬ, ХТО КОМУ ЩО ПЕРЕДАВ, ВІД ПИТАННЯ ДО НЬОГО",
};
