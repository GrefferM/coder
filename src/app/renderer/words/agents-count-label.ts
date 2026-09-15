import { ukrainianPlural } from "../utils/text";
import { AGENT_FORMS, NO_AGENTS_LABEL } from "../constants";

/** How many agents stand on a thing, in the Ukrainian forms; none is said in words, not as a zero. */
export function agentsCountLabel(count: number): string {
  if (count === 0) {
    return NO_AGENTS_LABEL;
  }

  const [one, few, many] = AGENT_FORMS;

  return `${count} ${ukrainianPlural(count, one, few, many)}`;
}
