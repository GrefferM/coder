import { COPIED_AGENT_FIRST_NUMBER } from "../constants";
import { plainly } from "../../../logic";

/** A copy of `EDITOR` is `EDITOR 2`, then `EDITOR 3`; a trailing number counts as that copy. */
export function copiedAgentName(sourceName: string, takenNames: string[]): string {
  const [stem] = sourceName.split(/\s+\d+$/);
  const taken = new Set(takenNames.map(plainly));
  let number = COPIED_AGENT_FIRST_NUMBER;

  while (taken.has(plainly(`${stem} ${number}`))) {
    number += 1;
  }

  return `${stem} ${number}`;
}
