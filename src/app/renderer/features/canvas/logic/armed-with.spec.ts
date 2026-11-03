import { describe, expect, it } from "vitest";
import { armedWith } from "./armed-with";
import {
  ARMED_AGENTS_COLOR,
  ARMED_BROKEN_COLOR,
  ARMED_COMMANDS_COLOR,
  ARMED_MARKS_EACH,
  ARMED_SERVERS_COLOR,
  ARMED_SYSTEM_COLOR,
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

/** Grants from `count` different servers; each server is its own mark. */
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

/** Grants of `count` other agents as tools; each agent is its own mark. */
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

/** The project file's order decides which marks stand and which fold. */
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

/** Names every source the fixtures grant, so no mark is broken unless a test says so with its own `saidOf`. */
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
    const orbs = armedWith([...granted(1), ...fromServers(1)], SAID);

    expect(orbs.find((orb) => orb.group === "commands")?.source).toBe("command");
    expect(orbs.find((orb) => orb.group !== "commands")?.source).toBe("mcp");
  });

  it("names the grant behind a command's mark, and none behind a server's", () => {
    const orbs = armedWith([...granted(1), ...fromServers(1)], SAID);

    expect(orbs.find((orb) => orb.group === "commands")?.grantId).toBe("grant-0");
    expect(orbs.find((orb) => orb.group === "server:server-0")?.grantId).toBeNull();
  });

  it("gives an agent armed with nothing no arc at all", () => {
    expect(armedWith([], SAID)).toEqual([]);
  });

  it("stands a mark of its own for every declared command, up to the two its kind is given", () => {
    const arc = armedWith(granted(2), SAID);

    expect(arc).toHaveLength(2);
    expect(arc.every((orb) => orb.color === ARMED_COMMANDS_COLOR && orb.more === null)).toBe(true);
  });

  it("folds a whole server into one mark, however many of its functions were granted", () => {
    // Only servers fold whole.
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
    expect(armedWith(granted(1), SAID)[0].color).toBe(ARMED_COMMANDS_COLOR);
  });

  it("splits the arc evenly by kind: two commands and a «+», two servers and a «+»", () => {
    // Six places by kind, not by number: two commands left, two servers right.
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
    const arc = armedWith([...fromServers(3), ...granted(1)], SAID);

    expect(arc.map((orb) => orb.source)).toEqual(["command", "mcp", "mcp", "mcp"]);
  });

  it("gives a kind no third place while there is nothing to fold", () => {
    // No empty hole on the arc: its width answers «how much».
    const arc = armedWith([...granted(ARMED_MARKS_EACH), ...fromServers(1)], SAID);

    expect(arc).toHaveLength(3);
    expect(arc.every((orb) => orb.more === null)).toBe(true);
  });

  it("lets a kind that is absent shorten the arc, never lend its places to the other", () => {
    // A kind never takes another's places, so the same drawing never means two things.
    const arc = armedWith(granted(9), SAID);

    expect(arc).toHaveLength(ARMED_MARKS_EACH + 1);
    expect(arc.at(-1)?.more).toBe("+7");
  });

  it("wears the kind's own colour on the «+», because there is no grey one any more", () => {
    const arc = armedWith([...granted(4), ...fromServers(4)], SAID);

    expect(arc.filter((orb) => orb.more !== null).map((orb) => orb.color)).toEqual([
      ARMED_COMMANDS_COLOR,
      ARMED_SERVERS_COLOR,
    ]);
  });

  it("takes the two that stand from the project file's order, not from what was granted first", () => {
    // Order is the file's, so a mark does not move when a tick is taken.
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
    // A grant whose command is gone keeps its mark; the panel reports it.
    const arc = armedWith(granted(2), saidOf(["command-1"], []));

    expect(arc.map((orb) => orb.grantId)).toEqual(["grant-1", "grant-0"]);
  });

  it("takes the trouble tone where every grant of a source points at nothing", () => {
    // No grants: no mark; all grants broken: a mark.
    const arc = armedWith(granted(2), saidOf(["command-1"], []));

    expect(arc.map((orb) => orb.isBroken)).toEqual([false, true]);
    expect(arc.map((orb) => orb.color)).toEqual([ARMED_COMMANDS_COLOR, ARMED_BROKEN_COLOR]);
  });

  it("leaves a source alone where one of its grants is broken and the others are not", () => {
    // Some broken grants among live ones do not tint the mark; the panel's pill says that.
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

  it("gives the kind's «+» the tone where the broken one did not fit its two places", () => {
    // Places go by the file, so the «+» carries the broken state of a mark that did not fit, and the arc does not move.
    const arc = armedWith(granted(4), saidOf(["command-0", "command-1", "command-2"], []));

    expect(arc.map((orb) => orb.isBroken)).toEqual([false, false, true]);
    expect(arc.at(-1)?.color).toBe(ARMED_BROKEN_COLOR);
    expect(arc.at(-1)?.hint.kind).toBe("ЩЕ 2 КОМАНДИ · 1 ЗЛАМАНИЙ");
  });

  it("stands what is broken first in the list a «+» raises, though the arc itself does not move", () => {
    const arc = armedWith(granted(4), saidOf(["command-0", "command-1", "command-3"], []));

    expect(arc.map((orb) => orb.grantId)).toEqual(["grant-0", "grant-1", null]);
    expect(arc.at(-1)?.folded?.map((row) => [row.name, row.isBroken])).toEqual([
      ["КОМАНДИ НЕМАЄ", true],
      ["command-3", false],
    ]);
  });

  it("says nothing at all about a call: the arc knows of none", () => {
    expect(Object.keys(armedWith(granted(1), SAID)[0]).includes("isCalling")).toBe(false);
  });

  it("names the group each mini-sphere leads to, and leaves the «+» without one", () => {
    const orbs = armedWith([...granted(3), ...fromServers(1)], SAID);

    expect(orbs.map((orb) => orb.group)).toEqual(["commands", "commands", null, "server:server-0"]);
  });

  it("counts two servers as two marks, not as one colour", () => {
    // Servers share one colour, so folding goes by group, not colour.
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

  it("stands the system commands last, a mark each in their own colour, never broken, and says what each is", () => {
    const arc = armedWith(
      [
        ...granted(1),
        {
          id: "grant-s1",
          source: "system",
          command: "pass_to",
        },
        {
          id: "grant-s2",
          source: "system",
          command: "finish_here",
        },
      ],
      SAID,
    );

    expect(arc.map((orb) => [orb.source, orb.group])).toEqual([
      ["command", "commands"],
      ["system", "system"],
      ["system", "system"],
    ]);
    expect(arc.filter((orb) => orb.source === "system").map((orb) => orb.color)).toEqual([
      ARMED_SYSTEM_COLOR,
      ARMED_SYSTEM_COLOR,
    ]);
    expect(arc.filter((orb) => orb.source === "system").map((orb) => orb.hint.name)).toEqual([
      "pass_to",
      "finish_here",
    ]);
    expect(arc.some((orb) => orb.isBroken)).toBe(false);
  });
});
