import { describe, expect, it } from "vitest";
import { armedWith } from "./armed-with";
import {
  ARMED_AGENTS_COLOR,
  ARMED_BROKEN_COLOR,
  ARMED_COMMANDS_COLOR,
  ARMED_MARKS_EACH,
  ARMED_SERVERS_COLOR,
} from "../constants";
import type { GrantTargets } from "../../../interfaces";
import type { ToolGrant } from "../../../interfaces";

function granted(count: number): ToolGrant[] {
  return Array.from(
    {
      length: count,
    },
    (_, at) => ({
      id: `grant-${at}`,
      source: "command" as const,
      commandId: `command-${at}`,
      pinned: [],
    }),
  );
}

/** Grants from `count` different servers — every server is a source of its own, so this is `count` marks. */
function fromServers(count: number): ToolGrant[] {
  return Array.from(
    {
      length: count,
    },
    (_, at) => ({
      id: `grant-server-${at}`,
      source: "mcp" as const,
      serverId: `server-${at}`,
      functionName: "search",
    }),
  );
}

/** Grants of `count` other agents as tools — each agent is a mark of its own. */
function ofAgents(count: number): ToolGrant[] {
  return Array.from(
    {
      length: count,
    },
    (_, at) => ({
      id: `grant-agent-${at}`,
      source: "agent" as const,
      agentId: `agent-${at}`,
    }),
  );
}

/** The project file's own order, which is what decides who stands and who folds. */
function saidOf(commandIds: string[], serverIds: string[], agentIds: string[] = []): GrantTargets {
  return <GrantTargets>(<unknown>{
    commands: commandIds.map((id) => ({
      id,
      name: id,
    })),
    servers: serverIds.map((id) => ({
      id,
      name: id,
    })),
    looks: {},
    agents: agentIds.map((id) => ({
      id,
      name: id,
    })),
  });
}

/**
 * What the sources say of themselves. It names **every** source the fixtures grant, because a grant pointing at
 * an undeclared source is broken, and the mark would take the trouble tone in a test that is not about trouble
 * at all. The tests that are about it say so with a `saidOf` of their own.
 */
const SAID = saidOf(
  Array.from(
    {
      length: 32,
    },
    (_, at) => `command-${at}`,
  ),
  Array.from(
    {
      length: 32,
    },
    (_, at) => `server-${at}`,
  ),
  Array.from(
    {
      length: 32,
    },
    (_, at) => `agent-${at}`,
  ),
);

describe("armedWith", () => {
  it("says which mini-sphere is a command and which a server, since the shape is drawn off that", () => {
    // The shape says the порода — a rounded square for a command, the globe for a server.
    const orbs = armedWith([...granted(1), ...fromServers(1)], SAID);

    expect(orbs.find((orb) => orb.group === "commands")?.source).toBe("command");
    expect(orbs.find((orb) => orb.group !== "commands")?.source).toBe("mcp");
  });

  it("names the grant behind a command's mark, and none behind a server's", () => {
    // THE FIRST RULE: a mark that stands for one grant carries that grant's own id, so a press has a page to open
    // and nobody has to guess which command it meant. A server's mark stands for the whole server, and names none.
    const orbs = armedWith([...granted(1), ...fromServers(1)], SAID);

    expect(orbs.find((orb) => orb.group === "commands")?.grantId).toBe("grant-0");
    expect(orbs.find((orb) => orb.group === "server:server-0")?.grantId).toBeNull();
  });

  it("gives an agent armed with nothing no arc at all", () => {
    expect(armedWith([], SAID)).toEqual([]);
  });

  it("stands a mark of its own for every declared command, up to the two its порода is given", () => {
    const arc = armedWith(granted(2), SAID);

    expect(arc).toHaveLength(2);
    expect(arc.every((orb) => orb.color === ARMED_COMMANDS_COLOR && orb.more === null)).toBe(true);
  });

  it("folds a whole server into one mark, however many of its functions were granted", () => {
    // Only the servers fold whole: twenty-four functions are the server's own affair, and the hand chose none.
    const arc = armedWith(
      Array.from(
        {
          length: 24,
        },
        (_, at) => ({
          id: `grant-f${at}`,
          source: "mcp" as const,
          serverId: "server-1",
          functionName: `f${at}`,
        }),
      ),
      SAID,
    );

    expect(arc).toHaveLength(1);
    expect(arc[0].more).toBeNull();
  });

  it("wears the colour of the source and never the agent's own", () => {
    // Four tools from two different places are to be seen at a glance, so colour says where from.
    expect(armedWith(granted(1), SAID)[0].color).toBe(ARMED_COMMANDS_COLOR);
  });

  it("splits the arc evenly by порода: two commands and a «+», two servers and a «+»", () => {
    // Six places, and not one of them shared by number — «дві команди ліворуч, два сервери праворуч».
    const arc = armedWith([...granted(7), ...fromServers(5)], SAID);

    expect(arc.map((orb) => [orb.source, orb.more])).toEqual([
      ["command", null],
      ["command", null],
      ["command", "+5"],
      ["mcp", null],
      ["mcp", null],
      ["mcp", "+3"],
    ]);
  });

  it("stands the commands on the left and the servers on the right, whichever there are more of", () => {
    // A порода's place on the arc is not its size: commands stand left and servers right, whichever there are more of.
    const arc = armedWith([...fromServers(3), ...granted(1)], SAID);

    expect(arc.map((orb) => orb.source)).toEqual(["command", "mcp", "mcp", "mcp"]);
  });

  it("gives a порода no third place while there is nothing to fold", () => {
    // «порожньої дірки на дузі не буває» — the arc's width is itself the answer to «how much».
    const arc = armedWith([...granted(ARMED_MARKS_EACH), ...fromServers(1)], SAID);

    expect(arc).toHaveLength(3);
    expect(arc.every((orb) => orb.more === null)).toBe(true);
  });

  it("lets a порода that is absent shorten the arc, never lend its places to the other", () => {
    // Three corners in a row would mean «two commands and the rest» beside one agent and «three
    // commands» beside another — the same drawing saying two different things.
    const arc = armedWith(granted(9), SAID);

    expect(arc).toHaveLength(ARMED_MARKS_EACH + 1);
    expect(arc.at(-1)?.more).toBe("+7");
  });

  it("wears the порода's own colour on the «+», because there is no grey one any more", () => {
    const arc = armedWith([...granted(4), ...fromServers(4)], SAID);

    expect(arc.filter((orb) => orb.more !== null).map((orb) => orb.color)).toEqual([
      ARMED_COMMANDS_COLOR,
      ARMED_SERVERS_COLOR,
    ]);
  });

  it("takes the two that stand from the project file's order, not from what was granted first", () => {
    // A mark that moves when a tick is taken reads as a different mark, so the order is the file's.
    const arc = armedWith(
      [...granted(3), ...fromServers(3)],
      saidOf(["command-2", "command-0", "command-1"], ["server-2", "server-1", "server-0"]),
    );

    expect(arc.filter((orb) => orb.source === "command").map((orb) => orb.grantId)).toEqual([
      "grant-2",
      "grant-0",
      null,
    ]);
    expect(arc.filter((orb) => orb.source !== "command").map((orb) => orb.group)).toEqual([
      "server:server-2",
      "server:server-1",
      null,
    ]);
  });

  it("stands a grant whose source the project has let go after the ones it still names", () => {
    // The grant outlives its command, and the arc is no place to learn that from — the panel says it.
    const arc = armedWith(granted(2), saidOf(["command-1"], []));

    expect(arc.map((orb) => orb.grantId)).toEqual(["grant-1", "grant-0"]);
  });

  it("takes the trouble tone where every grant of a source points at nothing", () => {
    // «нуль виданих — позначки немає, але всі видачі зламані — позначка є». The tone is the
    // states' family and not a source's, so it stands over the colour the source would have worn.
    const arc = armedWith(granted(2), saidOf(["command-1"], []));

    expect(arc.map((orb) => orb.isBroken)).toEqual([false, true]);
    expect(arc.map((orb) => orb.color)).toEqual([ARMED_COMMANDS_COLOR, ARMED_BROKEN_COLOR]);
  });

  it("leaves a source alone where one of its grants is broken and the others are not", () => {
    // «окремі зламані видачі при живих цілих купу не фарбують» — that is the panel's pill to say, and
    // one tone meaning two different things would be worse than saying nothing.
    const arc = armedWith(
      [
        ...fromServers(1),
        ...fromServers(1).map((grant) => ({
          ...grant,
          id: "grant-gone",
          functionName: "gone",
        })),
      ],
      <GrantTargets>(<unknown>{
        commands: [],
        servers: [
          {
            id: "server-0",
            name: "server-0",
          },
        ],
        looks: {
          "server-0": {
            isUp: true,
            answeredAt: 1,
            functions: [
              {
                name: "search",
              },
            ],
          },
        },
      }),
    );

    expect(arc).toHaveLength(1);
    expect(arc[0].isBroken).toBe(false);
  });

  it("gives the порода's «+» the tone where the broken one did not fit its two places", () => {
    // The hard two places hand out places by the file and not by the event, so they could have
    // hidden this state along with its source — the heap carries it instead, and nothing moves on the arc.
    const arc = armedWith(granted(4), saidOf(["command-0", "command-1", "command-2"], []));

    expect(arc.map((orb) => orb.isBroken)).toEqual([false, false, true]);
    expect(arc.at(-1)?.color).toBe(ARMED_BROKEN_COLOR);
    expect(arc.at(-1)?.hint.kind).toBe("ЩЕ 2 КОМАНДИ · 1 ЗЛАМАНИЙ");
  });

  it("stands what is broken first in the list a «+» raises, though the arc itself does not move", () => {
    // The list opened to say what is inside, and what is wrong is the first thing it has to say.
    const arc = armedWith(granted(4), saidOf(["command-0", "command-1", "command-3"], []));

    expect(arc.map((orb) => orb.grantId)).toEqual(["grant-0", "grant-1", null]);
    expect(arc.at(-1)?.folded?.map((row) => [row.name, row.isBroken])).toEqual([
      ["КОМАНДИ НЕМАЄ", true],
      ["command-3", false],
    ]);
  });

  it("says nothing at all about a call: the arc knows of none", () => {
    // «працює загальна сфера, і все». The arc stands the same whether the agent is calling
    // something or sitting still, so there is no third argument left for a call to come in by.
    expect(Object.keys(armedWith(granted(1), SAID)[0]).includes("isCalling")).toBe(false);
  });

  it("names the group each mini-sphere leads to, and leaves the «+» without one", () => {
    const orbs = armedWith([...granted(3), ...fromServers(1)], SAID);

    expect(orbs.map((orb) => orb.group)).toEqual(["commands", "commands", null, "server:server-0"]);
  });

  it("counts two servers as two marks, not as one colour", () => {
    // Every server shares one colour, so counting by colour would fold two into one mini-sphere and the press
    // would have no group to lead to.
    const orbs = armedWith(fromServers(2), SAID);

    expect(orbs).toHaveLength(2);
    expect(orbs.map((orb) => orb.group)).toEqual(["server:server-0", "server:server-1"]);
  });

  it("stands the agents third, each a mark of its own in the agents' colour, and folds the rest under their «+»", () => {
    const arc = armedWith([...ofAgents(3), ...granted(1), ...fromServers(1)], SAID);

    expect(arc.map((orb) => [orb.source, orb.more])).toEqual([
      ["command", null],
      ["mcp", null],
      ["agent", null],
      ["agent", null],
      ["agent", "+1"],
    ]);
    expect(arc.filter((orb) => orb.source === "agent").map((orb) => orb.color)).toEqual([
      ARMED_AGENTS_COLOR,
      ARMED_AGENTS_COLOR,
      ARMED_AGENTS_COLOR,
    ]);
  });

  it("keeps the mark of an agent the project has let go, in the trouble tone", () => {
    const [orb] = armedWith(ofAgents(1), saidOf([], [], []));

    expect(orb.source).toBe("agent");
    expect(orb.color).toBe(ARMED_BROKEN_COLOR);
  });
});
