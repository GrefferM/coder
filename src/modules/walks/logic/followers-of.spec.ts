import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aConfig, anAgent } from "../../../utils/testing";
import { followersOf } from "./followers-of";

describe("followersOf", () => {
  it("names the agents the lines lead to, in the order of the lines, with what each is for", () => {
    const from = anAgent({
      id: "a",
      name: "ПЛАНУВАЛЬНИК",
    });
    const teller = anAgent({
      id: "b",
      name: "КОДЕР",
      purpose: "Пише код",
    });
    const translator = anAgent({
      id: "c",
      name: "ПЕРЕВІРНИК",
      purpose: null,
    });
    const config = aConfig({
      agents: [from, teller, translator],
      links: [
        {
          id: "l1",
          from: "a",
          to: "c",
        },
        {
          id: "l2",
          from: "a",
          to: "b",
        },
      ],
    });

    assert.deepEqual(followersOf(config, from), [
      {
        agentId: "c",
        name: "ПЕРЕВІРНИК",
        purpose: null,
      },
      {
        agentId: "b",
        name: "КОДЕР",
        purpose: "Пише код",
      },
    ]);
  });

  it("leaves out an agent that is switched off, since it cannot take the work", () => {
    const from = anAgent({
      id: "a",
    });
    const off = anAgent({
      id: "b",
      isActive: false,
    });
    const on = anAgent({
      id: "c",
      name: "РЕЦЕНЗЕНТ",
    });
    const config = aConfig({
      agents: [from, off, on],
      links: [
        {
          id: "l1",
          from: "a",
          to: "b",
        },
        {
          id: "l2",
          from: "a",
          to: "c",
        },
      ],
    });

    assert.deepEqual(
      followersOf(config, from).map((follower) => follower.agentId),
      ["c"],
    );
  });

  it("has none where no line leaves the agent", () => {
    const from = anAgent({
      id: "a",
    });

    assert.deepEqual(
      followersOf(
        aConfig({
          agents: [from],
          links: [],
        }),
        from,
      ),
      [],
    );
  });
});
