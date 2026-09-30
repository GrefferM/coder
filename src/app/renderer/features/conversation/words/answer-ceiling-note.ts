import { CHAT_ANSWER_CEILING_PREFIX, CHAT_ANSWER_CEILING_UNIT, CHAT_CALLS_EXHAUSTED_SEPARATOR } from "../constants";
import { UNKNOWN_NUMBER } from "../../../utils/numbers/constants";

/** «ВІДПОВІДЬ УПЕРЛАСЯ В СТЕЛЮ · 4096 ТКН». The number is shown as written, ungrouped. */
export function answerCeilingNote(answerCeiling: number | null): string {
  const number = answerCeiling === null ? UNKNOWN_NUMBER : `${answerCeiling}`;

  return `${CHAT_ANSWER_CEILING_PREFIX}${CHAT_CALLS_EXHAUSTED_SEPARATOR}${number}${CHAT_ANSWER_CEILING_UNIT}`;
}
