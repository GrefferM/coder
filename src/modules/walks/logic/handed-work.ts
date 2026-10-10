import { WORK_BLOCK_SEPARATOR } from "../../../contracts";
import type { HandedAnswer } from "../../../contracts";

/** Work from a line as the receiver is given it: the answers alone. */
export function handedWork(handed: HandedAnswer[]): string {
  return handed.map((one) => one.text).join(WORK_BLOCK_SEPARATOR);
}
