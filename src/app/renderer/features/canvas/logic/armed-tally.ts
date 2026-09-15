import { brokenCause } from "../../../logic";
import type { SourcesSaid } from "../interfaces";
import type { ToolGrant } from "../../../interfaces";

/**
 * The one number the trail's key carries — how many functions this agent can call. Every source
 * together, and a declared command counts as one function, exactly as «3 ДЖЕРЕЛА · 7 ФУНКЦІЙ» and «ІНСТРУМЕНТИ · N»
 * count it in the panel.
 *
 * What points at nothing is not in it: «числа скрізь рахують те, що можна покликати». So this number and the arc
 * answer two different questions — the arc says which kinds an agent is armed with, and this says how much of it
 * there is, which is the only word left about arming once a порода folds into a «+».
 */
export function armedTally(tools: ToolGrant[], said: SourcesSaid): number {
  return tools.filter((grant) => brokenCause(grant, said.commands, said.servers, said.looks) === null).length;
}
