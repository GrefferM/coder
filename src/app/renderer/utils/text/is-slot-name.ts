import { TEMPLATE_NAME_PATTERN } from "./constants";

/** Whether a name can stand in the braces of a run line. */
export function isSlotName(name: string): boolean {
  return TEMPLATE_NAME_PATTERN.test(name);
}
