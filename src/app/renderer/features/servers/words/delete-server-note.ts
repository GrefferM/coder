import { ukrainianPlural } from "../../../utils/text";
import {
  DELETE_SERVER_AGENT_FORMS,
  DELETE_SERVER_FUNCTION_FORMS,
  DELETE_SERVER_GRANT_JOIN,
  DELETE_SERVER_IN_AGENTS,
  DELETE_SERVER_KEYCHAIN_NOTE,
  DELETE_SERVER_LAST_JOIN,
  DELETE_SERVER_NOTE_END,
  DELETE_SERVER_NOTE_PREFIX,
  DELETE_SERVER_TOKEN_NOTE,
  DELETE_SERVER_VALUE_FORMS,
  DELETE_SERVER_VALUE_PREFIX,
} from "../constants";
import type { ServerBurden } from "../interfaces";

/** What goes with the server, in words. Only the burdens that are there are named; the project-file row never is. */
export function deleteServerNote(name: string, burden: ServerBurden): string {
  const parts = [grantsPart(burden), keysPart(burden)].filter((part) => part !== null);
  const said = parts.length === 2 ? `${parts[0]}${DELETE_SERVER_LAST_JOIN}${parts[1]}` : (parts[0] ?? "");

  return `${DELETE_SERVER_NOTE_PREFIX}${name}${said === "" ? "" : DELETE_SERVER_GRANT_JOIN}${said}${DELETE_SERVER_NOTE_END}`;
}

/** «12 його функцій в 1 агента»: what the agents lose, counted by grants. */
function grantsPart(burden: ServerBurden): string | null {
  if (burden.grants === 0) {
    return null;
  }

  const [one, few, many] = DELETE_SERVER_FUNCTION_FORMS;
  const [agentOne, agentFew, agentMany] = DELETE_SERVER_AGENT_FORMS;
  const functions = `${burden.grants} ${ukrainianPlural(burden.grants, one, few, many)}`;
  const agents = `${burden.agents} ${ukrainianPlural(burden.agents, agentOne, agentFew, agentMany)}`;

  return `${functions}${DELETE_SERVER_IN_AGENTS}${agents}`;
}

/** «токен і значення 2 змінних із ключника цієї машини»: what leaves this machine's keychain. */
function keysPart(burden: ServerBurden): string | null {
  const [one, few, many] = DELETE_SERVER_VALUE_FORMS;
  const held: string[] = [];

  if (burden.hasToken) {
    held.push(DELETE_SERVER_TOKEN_NOTE);
  }

  if (burden.values > 0) {
    held.push(`${DELETE_SERVER_VALUE_PREFIX}${burden.values} ${ukrainianPlural(burden.values, one, few, many)}`);
  }

  return held.length === 0 ? null : `${held.join(DELETE_SERVER_LAST_JOIN)}${DELETE_SERVER_KEYCHAIN_NOTE}`;
}
