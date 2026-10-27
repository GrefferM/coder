import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { systemTools } from "./system-tools";
import type { ToolGrant } from "../project";

const TELLER = {
  agentId: "a1",
  name: "КОДЕР",
  purpose: "Пише код",
};

const BOTH: ToolGrant[] = [
  {
    id: "g1",
    source: "system",
    command: "pass_to",
  },
  {
    id: "g2",
    source: "system",
    command: "finish_here",
  },
];

describe("systemTools", () => {
  it("gives nothing where no line leads anywhere, since there is then nothing to choose", () => {
    assert.deepEqual(systemTools(BOTH, []), []);
  });

  it("gives only the commands the agent was granted, in the order of the grants", () => {
    assert.deepEqual(
      systemTools([BOTH[1]], [TELLER]).map((tool) => tool.name),
      ["finish_here"],
    );
    assert.deepEqual(
      systemTools([BOTH[1], BOTH[0]], [TELLER]).map((tool) => tool.name),
      ["finish_here", "pass_to"],
    );
    assert.deepEqual(systemTools([], [TELLER]), []);
  });

  it("leaves any grant that is no system command alone", () => {
    assert.deepEqual(
      systemTools(
        [
          {
            id: "g3",
            source: "command",
            commandId: "c1",
            pinned: [],
          },
        ],
        [TELLER],
      ),
      [],
    );
  });

  it("gives pass_to and finish_here, finish_here naming nobody", () => {
    const [pass, finish] = systemTools(BOTH, [
      TELLER,
      {
        agentId: "a2",
        name: "ПЕРЕВІРНИК",
        purpose: null,
      },
    ]);

    assert.deepEqual(
      [pass.name, pass.command, pass.source, finish.name, finish.command, finish.source],
      ["pass_to", "pass_to", "system", "finish_here", "finish_here", "system"],
    );
    assert.deepEqual(pass.options, [
      {
        agentId: "a1",
        label: "КОДЕР",
      },
      {
        agentId: "a2",
        label: "ПЕРЕВІРНИК",
      },
    ]);
    assert.deepEqual(finish.options, []);
  });

  it("lists whom the answer may go to, each with what it is for where that is written", () => {
    const [pass] = systemTools(
      [BOTH[0]],
      [
        TELLER,
        {
          agentId: "a2",
          name: "ПЕРЕВІРНИК",
          purpose: "  ",
        },
      ],
    );

    assert.ok(pass.description.endsWith("\n- КОДЕР — Пише код\n- ПЕРЕВІРНИК"));
  });

  it("tells agents of one name apart by a number, so the word the model gives names one of them", () => {
    const [pass] = systemTools(
      [BOTH[0]],
      [
        TELLER,
        {
          ...TELLER,
          agentId: "a2",
        },
        {
          ...TELLER,
          agentId: "a3",
        },
      ],
    );

    assert.deepEqual(
      pass.options.map((option) => option.label),
      ["КОДЕР", "КОДЕР (2)", "КОДЕР (3)"],
    );
  });

  it("does not hand out a number an agent already wears as its name", () => {
    const [pass] = systemTools(
      [BOTH[0]],
      [
        {
          ...TELLER,
          agentId: "a1",
          name: "КОДЕР (2)",
        },
        {
          ...TELLER,
          agentId: "a2",
        },
        {
          ...TELLER,
          agentId: "a3",
        },
      ],
    );

    assert.deepEqual(
      pass.options.map((option) => option.label),
      ["КОДЕР (2)", "КОДЕР", "КОДЕР (3)"],
    );
  });
});
