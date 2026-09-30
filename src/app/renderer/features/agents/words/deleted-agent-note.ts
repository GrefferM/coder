import {
  DELETED_AGENT_NOTE_ALONE,
  DELETED_AGENT_NOTE_LAST_JOIN,
  DELETED_AGENT_NOTE_LINKS,
  DELETED_AGENT_NOTE_MANY_TAIL,
  DELETED_AGENT_NOTE_ONE_TAIL,
  DELETED_AGENT_NOTE_PREFIX,
  DELETED_AGENT_NOTE_SEPARATOR,
} from "../constants";

/**
 * «Заберемо сферу EDITOR і її зв'язки. PLANNER і REVIEWER лишаться, кожен сам по собі.»: the thing first, then what
 * goes or stays; a sphere with no ties has no second half.
 */
export function deletedAgentNote(name: string, neighbourNames: string[]): string {
  const last = neighbourNames.at(-1);

  if (last === undefined) {
    return `${DELETED_AGENT_NOTE_PREFIX}${name}${DELETED_AGENT_NOTE_ALONE}`;
  }

  const named = neighbourNames.slice(0, -1).join(DELETED_AGENT_NOTE_SEPARATOR);
  const names = named ? `${named}${DELETED_AGENT_NOTE_LAST_JOIN}${last}` : last;
  const tail = neighbourNames.length === 1 ? DELETED_AGENT_NOTE_ONE_TAIL : DELETED_AGENT_NOTE_MANY_TAIL;

  return `${DELETED_AGENT_NOTE_PREFIX}${name}${DELETED_AGENT_NOTE_LINKS} ${names} ${tail}`;
}
