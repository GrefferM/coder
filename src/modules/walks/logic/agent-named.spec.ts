import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { agentNamed } from "./agent-named";
import { anAgent } from "../../../contracts/testing";

const AGENTS = [
  anAgent({
    id: "a-1",
    name: "Редактор",
  }),
  anAgent({
    id: "a-2",
    name: "Рецензент",
  }),
];

describe("agentNamed", () => {
  it("finds an agent by its id", () => {
    assert.equal(agentNamed(AGENTS, "a-2").name, "Рецензент");
  });

  it("finds an agent by its name, whatever the case and the spaces round it", () => {
    assert.equal(agentNamed(AGENTS, " редактор ").id, "a-1");
  });

  it("prefers the id where a name is also someone's id", () => {
    const tricky = [
      ...AGENTS,
      anAgent({
        id: "Редактор",
        name: "Інший",
      }),
    ];

    assert.equal(agentNamed(tricky, "Редактор").name, "Інший");
  });

  it("asks for the id where several agents bear the name", () => {
    const twins = [
      ...AGENTS,
      anAgent({
        id: "a-3",
        name: "редактор",
      }),
    ];

    assert.throws(() => agentNamed(twins, "Редактор"), /a-1, a-3/);
  });

  it("names the agents the project has when none bears the name", () => {
    assert.throws(() => agentNamed(AGENTS, "Хтось"), /Хтось.*Редактор, Рецензент/);
  });

  it("says so when the project has no agent at all", () => {
    assert.throws(() => agentNamed([], "Хтось"), /ще немає агентів/);
  });
});
