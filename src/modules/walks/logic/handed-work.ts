import { WORK_BLOCK_SEPARATOR } from "../../../contracts";
import type { HandedAnswer } from "../../../contracts";

/**
 * Work from a line as the receiver is given it: the answers alone. A converging point that lost suppliers on the way
 * (they chose not to pass on, or ended their branch) is told how many, so it does not take the work for the whole.
 */
export function handedWork(handed: HandedAnswer[], missing = 0): string {
  const answers = handed.map((one) => one.text).join(WORK_BLOCK_SEPARATOR);

  if (missing <= 0) {
    return answers;
  }

  return `${answers}${WORK_BLOCK_SEPARATOR}Не передали нічого: ${missing} з ${handed.length + missing} постачальників роботи.`;
}
