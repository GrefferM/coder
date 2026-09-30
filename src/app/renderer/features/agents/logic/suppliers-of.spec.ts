import { describe, expect, it } from "vitest";
import { suppliersOf } from "./suppliers-of";
import { aConfig, aLink, anAgent } from "../../../testing";

const SEEKER = anAgent({
  id: "agent-1",
  name: "Шукач",
});
const TELLER = anAgent({
  id: "agent-2",
  name: "Тезар",
});
const WRITER = anAgent({
  id: "agent-3",
  name: "Звітар",
});

const CONFIG = aConfig({
  agents: [SEEKER, TELLER, WRITER],
  links: [
    aLink({
      id: "link-1",
      from: "agent-2",
      to: "agent-1",
    }),
    aLink({
      id: "link-2",
      from: "agent-3",
      to: "agent-1",
    }),
    aLink({
      id: "link-3",
      from: "agent-1",
      to: "agent-2",
    }),
  ],
});

describe("suppliersOf", () => {
  it("gives the agents whose lines come into this one, in the order the file holds them", () => {
    // Order follows the project file.
    expect(suppliersOf(CONFIG, "agent-1").map((agent) => agent.id)).toEqual(["agent-2", "agent-3"]);
  });

  it("does not count a line going the other way", () => {
    // «agent-1 → agent-2» makes agent-1 a supplier of agent-2 only, not the reverse.
    expect(suppliersOf(CONFIG, "agent-2").map((agent) => agent.id)).toEqual(["agent-1"]);
  });

  it("gives nothing for an agent nobody feeds", () => {
    expect(suppliersOf(CONFIG, "agent-3")).toEqual([]);
  });

  it("gives nothing when no agent is asked about", () => {
    expect(suppliersOf(CONFIG, null)).toEqual([]);
  });

  it("drops a line that comes from an agent the project no longer has", () => {
    // A dangling line leaves no hole in the list.
    const config = aConfig({
      agents: [SEEKER, TELLER],
      links: [
        aLink({
          id: "link-1",
          from: "agent-gone",
          to: "agent-1",
        }),
        aLink({
          id: "link-2",
          from: "agent-2",
          to: "agent-1",
        }),
      ],
    });

    expect(suppliersOf(config, "agent-1").map((agent) => agent.id)).toEqual(["agent-2"]);
  });
});
