import { isCommandGrant, sourceOf } from "../../../interfaces";
import {
  ARMED_BROKEN_COLOR,
  ARMED_COMMANDS_COLOR,
  ARMED_MARKS_EACH,
  ARMED_REST_PREFIX,
  ARMED_SERVERS_COLOR,
} from "../constants";
import { brokenCause } from "../../../logic";
import { foldHint, orbHint } from "./orb-hint";
import type { ArmedFold, ArmedOrb, SourcesSaid } from "../interfaces";
import { COMMANDS_GROUP_KEY, SERVER_GROUP_PREFIX, groupOfGrant } from "../../../constants";
import type { ToolGrant } from "../../../interfaces";

/**
 * The arc of mini-spheres over an agent — what it is armed with, never which functions exactly. Each wears its
 * **source's** colour, so tools from two different places are seen at a glance.
 *
 * The six places are shared by **порода** and not by number: two commands, two servers, and a third place under
 * each порода's own «+». So the arc says which kinds the agent carries and where there are many, rather than
 * naming sources — which holds at three sources and at twenty alike.
 *
 * A порода never takes the other's places: with no servers the arc is simply shorter, because three corners in
 * a row would mean «two commands and the rest» beside one agent and «three commands» beside another.
 *
 * A source whose every grant points at nothing keeps its mark and takes the trouble tone; where the two places
 * hid it, the порода's «+» takes that tone instead, and nothing on the arc is ever rearranged for it.
 */
export function armedWith(tools: ToolGrant[], said: SourcesSaid): ArmedOrb[] {
  return [...sideOf(commandMarks(tools, said), said), ...sideOf(serverMarks(tools, said), said)];
}

/** One mini-sphere before it is drawn: a single declared command, or a whole server with everything granted of it. */
interface ArmedMark extends ArmedFold {
  /** A command's mark names its own grant, so a press has one page to open; a server names none. */
  grantId: string | null;
  /** Every grant behind this mark points at nothing, so the mark itself is the trouble. */
  isBroken: boolean;
}

/**
 * One порода's own stretch of the arc — up to two marks, and a «+» of that same порода where there is
 * something left. The third place stands **only** when there is something to fold: an empty hole on the arc would
 * say «there is more» where there is not, and the arc's width is itself the answer to «how much has this agent».
 */
function sideOf(marks: ArmedMark[], said: SourcesSaid): ArmedOrb[] {
  const standing = marks.slice(0, ARMED_MARKS_EACH).map((mark) => orbOf(mark, said));
  const folded = marks.slice(ARMED_MARKS_EACH);

  return folded.length === 0 ? standing : [...standing, foldOf(folded, said)];
}

/**
 * Which two stand is read off the **project file** — commands in the order they were declared — and not
 * off this agent's ticks. A mark that changes place when a tick is taken reads as a different mark, so taking one
 * back must move nothing on the arc: only the number under «+» changes.
 *
 * A grant whose command the project has let go keeps its mark and stands after the known ones: it is broken, the
 * panel says so, and the arc is no place to learn it from.
 */
function commandMarks(tools: ToolGrant[], said: SourcesSaid): ArmedMark[] {
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
 * One mark per server whatever it hands over, in the order the project connected them — a server
 * arrives whole and the hand chose nothing inside it, so there is nothing there to count places by.
 */
function serverMarks(tools: ToolGrant[], said: SourcesSaid): ArmedMark[] {
  const byServer = new Map<string, ToolGrant[]>();

  for (const tool of tools) {
    const group = groupOfGrant(tool);

    if (group !== COMMANDS_GROUP_KEY) {
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

/** One mini-sphere: a whole server, or a single declared command. */
function orbOf(mark: ArmedMark, said: SourcesSaid): ArmedOrb {
  return {
    group: mark.group,
    grantId: mark.grantId,
    // The tone of trouble is the states' family and not a source's, so it stands over the source colour.
    color: mark.isBroken ? ARMED_BROKEN_COLOR : colorOf(mark.group),
    more: null,
    folded: null,
    // The shape says where a tool came from — a rounded square for a command, the globe for a server.
    isCommand: mark.group === COMMANDS_GROUP_KEY,
    isBroken: mark.isBroken,
    hint: orbHint(mark.group, mark.granted, said),
  };
}

/**
 * The heap of one порода, in that порода's own shape and colour — two identical grey ones side by side would read
 * as a single heap. It names no source, so a press leads to the section and not to a page.
 */
function foldOf(folded: ArmedMark[], said: SourcesSaid): ArmedOrb {
  const isCommand = folded[0].group === COMMANDS_GROUP_KEY;
  // The hard two places could have hidden this state along with its source, so the heap carries it.
  const broken = folded.filter((mark) => mark.isBroken).length;

  return {
    group: null,
    grantId: null,
    color: broken > 0 ? ARMED_BROKEN_COLOR : isCommand ? ARMED_COMMANDS_COLOR : ARMED_SERVERS_COLOR,
    // One mark apiece: a folded command is one, and a folded server is one however much it hands over.
    more: `${ARMED_REST_PREFIX}${folded.length}`,
    /**
     * The press raises the list of exactly these, and each line carries the id of what it stands for.
     * What is broken stands **first** — the arc's own order does not move, but the list opened to say
     * what is inside, and what is wrong is the first thing it has to say.
     */
    folded: [...folded]
      .sort((one, other) => Number(other.isBroken) - Number(one.isBroken))
      .map((mark) => ({
        group: mark.group,
        grantId: mark.grantId,
        name: orbHint(mark.group, mark.granted, said).name,
        color: mark.isBroken ? ARMED_BROKEN_COLOR : colorOf(mark.group),
        isBroken: mark.isBroken,
      })),
    isCommand,
    isBroken: broken > 0,
    hint: foldHint(folded, broken, said),
  };
}

/**
 * A source is the trouble itself only where **every** grant of it points at nothing — «нуль
 * виданих — позначки немає, але всі видачі зламані — позначка є». One broken grant among whole ones is the panel's
 * to say with its own pill, and colouring the arc for it would make the tone mean two different things.
 */
function isBroken(granted: ToolGrant[], said: SourcesSaid): boolean {
  return (
    granted.length > 0 && granted.every((grant) => brokenCause(grant, said.commands, said.servers, said.looks) !== null)
  );
}

/** A grant outlives the command under it, and the id it kept is still how that command is looked for. */
function commandIdOf(grant: ToolGrant): string | null {
  return isCommandGrant(grant) ? sourceOf(grant).id : null;
}

/**
 * The source's colour. Every server takes the same one, so the arc says «this came from a server» rather than
 * «from that server».
 */
function colorOf(group: string): string {
  return group === COMMANDS_GROUP_KEY ? ARMED_COMMANDS_COLOR : ARMED_SERVERS_COLOR;
}
