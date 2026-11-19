import { describe, expect, it } from "vitest";
import { walkRoute } from "./walk-route";
import { aLink, anAgent } from "../../../testing";

const AGENTS = ["editor", "tester", "linter", "reviewer", "summary", "docs"].map((id) =>
  anAgent({
    id,
    name: id.toUpperCase(),
  }),
);

describe("walkRoute", () => {
  it("lays a branch and a join out with every agent after all that hand work to it", () => {
    const links = [
      aLink({
        id: "l1",
        from: "editor",
        to: "tester",
      }),
      aLink({
        id: "l2",
        from: "editor",
        to: "linter",
      }),
      aLink({
        id: "l3",
        from: "tester",
        to: "reviewer",
      }),
      aLink({
        id: "l4",
        from: "linter",
        to: "reviewer",
      }),
      aLink({
        id: "l5",
        from: "reviewer",
        to: "summary",
      }),
    ];

    expect(walkRoute(AGENTS, links, "editor")).toEqual([
      {
        id: "editor",
        place: 0,
        fromStepIds: [],
      },
      {
        id: "tester",
        place: 1,
        fromStepIds: ["editor"],
      },
      {
        id: "linter",
        place: 2,
        fromStepIds: ["editor"],
      },
      {
        id: "reviewer",
        place: 3,
        fromStepIds: ["tester", "linter"],
      },
      {
        id: "summary",
        place: 4,
        fromStepIds: ["reviewer"],
      },
    ]);
  });

  it("is the sphere alone where no line leaves it", () => {
    expect(walkRoute(AGENTS, [], "docs")).toEqual([
      {
        id: "docs",
        place: 0,
        fromStepIds: [],
      },
    ]);
  });

  it("does not walk into a switched-off agent, nor on from it", () => {
    const agents = AGENTS.map((agent) =>
      agent.id === "tester"
        ? {
            ...agent,
            isActive: false,
          }
        : agent,
    );
    const links = [
      aLink({
        id: "l1",
        from: "editor",
        to: "tester",
      }),
      aLink({
        id: "l2",
        from: "tester",
        to: "reviewer",
      }),
    ];

    expect(walkRoute(agents, links, "editor").map((knot) => knot.id)).toEqual(["editor"]);
  });
});
