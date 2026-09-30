import { WORK_BLOCK_SEPARATOR } from "../constants";
import type { HandedAnswer } from "../interfaces";

/** Work from a line as the receiver is given it: the answers alone. */
export function handedWork(handed: HandedAnswer[]): string {
  return handed.map((one) => one.text).join(WORK_BLOCK_SEPARATOR);
}
