import { isAgentGrant, isCommandGrant, sourceOf } from "../../../interfaces";
import { ARMED_BROKEN_COLOR, ARMED_MARKS_EACH, ARMED_REST_PREFIX, ARMED_SOURCE_COLOR } from "../constants";
import { brokenCause } from "../../../logic";
import { foldHint, orbHint } from "./orb-hint";
import { sourceOfGroup } from "./source-of-group";
import type { ArmedFold, ArmedOrb } from "../interfaces";
import type { GrantTargets } from "../../../interfaces";
import { AGENTS_GROUP_KEY, COMMANDS_GROUP_KEY, SERVER_GROUP_PREFIX, groupOfGrant } from "../../../constants";
import type { ToolGrant } from "../../../interfaces";

/**
 * The arc of mini-spheres over an agent: what it is armed with, not which functions. Each mark wears its source's
 * colour.
 *
 * Nine places by kind, not by number: two commands, two servers, two agents, and a third place under each kind's «+». A
 * kind never takes another's places, so the arc may be shorter. A source whose every grant points at nothing takes the
 * trouble tone; if folded, its kind's «+» takes it.
 */
export function armedWith(tools: ToolGrant[], said: GrantTargets): ArmedOrb[] {
  return [
    ...sideOf(commandMarks(tools, said), said),
    ...sideOf(serverMarks(tools, said), said),
    ...sideOf(agentMarks(tools, said), said),
  ];
}

/** One mini-sphere before it is drawn: a command, a whole server, or an agent granted as a tool. */
interface ArmedMark extends ArmedFold {
  /** A command's or agent's mark names its own grant; a server names none. */
  grantId: string | null;
  /** Every grant behind this mark points at nothing. */
  isBroken: boolean;
}

/** One kind's stretch of the arc: up to two marks, plus a «+» only when something is left to fold. */
function sideOf(marks: ArmedMark[], said: GrantTargets): ArmedOrb[] {
  const standing = marks.slice(0, ARMED_MARKS_EACH).map((mark) => orbOf(mark, said));
  const folded = marks.slice(ARMED_MARKS_EACH);

  return folded.length === 0 ? standing : [...standing, foldOf(folded, said)];
}

/**
 * The two that stand come from the project file's order, not from this agent's ticks. A grant whose command the project
 * dropped is broken and stands after the known ones.
 */
function commandMarks(tools: ToolGrant[], said: GrantTargets): ArmedMark[] {
  const declared = tools.filter((tool) => groupOfGrant(tool) === COMMANDS_GROUP_KEY);
  const placeOf = (grant: ToolGrant) => said.commands.findIndex((one) => one.id === commandIdOf(grant));

  return [
    ...declared.filter((grant) => placeOf(grant) !== -1).sort((one, other) => placeOf(one) - placeOf(other)),
    ...declared.filter((grant) => placeOf(grant) === -1),
  ].map((grant) => ({
    group: COMMANDS_GROUP_KEY,
    grantId: grant.id,
    granted: [grant],
    isBroken: isBroken([grant], said),
  }));
}

/**
 * One mark per agent granted as a tool, in the project's order; a grant whose agent the project dropped is broken and
 * stands after the known ones.
 */
function agentMarks(tools: ToolGrant[], said: GrantTargets): ArmedMark[] {
  const granted = tools.filter((tool) => groupOfGrant(tool) === AGENTS_GROUP_KEY);
  const placeOf = (grant: ToolGrant) => said.agents.findIndex((one) => one.id === agentIdOf(grant));

  return [
    ...granted.filter((grant) => placeOf(grant) !== -1).sort((one, other) => placeOf(one) - placeOf(other)),
    ...granted.filter((grant) => placeOf(grant) === -1),
  ].map((grant) => ({
    group: AGENTS_GROUP_KEY,
    grantId: grant.id,
    granted: [grant],
    isBroken: isBroken([grant], said),
  }));
}

/** One mark per server, in the order the project connected them, whatever it hands over. */
function serverMarks(tools: ToolGrant[], said: GrantTargets): ArmedMark[] {
  const byServer = new Map<string, ToolGrant[]>();

  for (const tool of tools) {
    const group = groupOfGrant(tool);

    if (group !== COMMANDS_GROUP_KEY && group !== AGENTS_GROUP_KEY) {
      byServer.set(group, [...(byServer.get(group) ?? []), tool]);
    }
  }

  const placeOf = (group: string) => said.servers.findIndex((one) => `${SERVER_GROUP_PREFIX}${one.id}` === group);
  const groups = [...byServer.keys()];

  return [
    ...groups.filter((group) => placeOf(group) !== -1).sort((one, other) => placeOf(one) - placeOf(other)),
    ...groups.filter((group) => placeOf(group) === -1),
  ].map((group) => ({
    group,
    grantId: null,
    granted: byServer.get(group) ?? [],
    isBroken: isBroken(byServer.get(group) ?? [], said),
  }));
}

/** One mini-sphere: a server, a declared command, or an agent granted as a tool. */
function orbOf(mark: ArmedMark, said: GrantTargets): ArmedOrb {
  return {
    group: mark.group,
    grantId: mark.grantId,
    // The trouble tone overrides the source colour.
    color: mark.isBroken ? ARMED_BROKEN_COLOR : ARMED_SOURCE_COLOR[sourceOfGroup(mark.group)],
    more: null,
    folded: null,
    source: sourceOfGroup(mark.group),
    isBroken: mark.isBroken,
    hint: orbHint(mark.group, mark.granted, said),
  };
}

/** The heap of one kind, in its own shape and colour; names no source, so a press leads to the section. */
function foldOf(folded: ArmedMark[], said: GrantTargets): ArmedOrb {
  const source = sourceOfGroup(folded[0].group);
  // The folded «+» carries the broken state of marks that did not fit.
  const broken = folded.filter((mark) => mark.isBroken).length;

  return {
    group: null,
    grantId: null,
    color: broken > 0 ? ARMED_BROKEN_COLOR : ARMED_SOURCE_COLOR[source],
    // One mark apiece: a folded server counts as one.
    more: `${ARMED_REST_PREFIX}${folded.length}`,
    /** The list a press raises: exactly these, each line with the id of what it stands for, broken ones first. */
    folded: [...folded]
      .sort((one, other) => Number(other.isBroken) - Number(one.isBroken))
      .map((mark) => ({
        group: mark.group,
        grantId: mark.grantId,
        name: orbHint(mark.group, mark.granted, said).name,
        color: mark.isBroken ? ARMED_BROKEN_COLOR : ARMED_SOURCE_COLOR[source],
        isBroken: mark.isBroken,
      })),
    source,
    isBroken: broken > 0,
    hint: foldHint(folded, broken, said),
  };
}

/**
 * A source is broken only when every grant of it points at nothing; a single broken grant is the panel's pill to say.
 */
function isBroken(granted: ToolGrant[], said: GrantTargets): boolean {
  return granted.length > 0 && granted.every((grant) => brokenCause(grant, said) !== null);
}

/** A grant keeps the id of its command even after the command is gone. */
function commandIdOf(grant: ToolGrant): string | null {
  return isCommandGrant(grant) ? sourceOf(grant).id : null;
}

/** A grant keeps the id of its agent even after the agent is gone. */
function agentIdOf(grant: ToolGrant): string | null {
  return isAgentGrant(grant) ? sourceOf(grant).id : null;
}
