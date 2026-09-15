import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ToolArguments } from "./tool-arguments.service";
import type { AgentCommandTool, AgentToolParameter } from "../interfaces";

function parameter(patch: Partial<AgentToolParameter>): AgentToolParameter {
  return {
    name: "depth",
    description: "Глибина",
    type: "number",
    isRequired: true,
    values: [],
    ...patch,
  };
}

function tool(parameters: AgentToolParameter[]): AgentCommandTool {
  return {
    source: "command",
    name: "find_deep",
    description: "Шукає файли",
    run: "find . -maxdepth {depth}",
    parameters,
    pinned: {},
  };
}

describe("ToolArguments", () => {
  const checking = new ToolArguments();

  it("says nothing when every argument holds to what the command declared", () => {
    assert.deepEqual(
      checking.complaints(
        tool([
          parameter({}),
          parameter({
            name: "mask",
            type: "text",
          }),
        ]),
        {
          depth: "2",
          mask: "*.md",
        },
      ),
      [],
    );
  });

  it("names a number that is not a number, and says what came instead", () => {
    const complaints = checking.complaints(tool([parameter({})]), {
      depth: "швидко",
    });

    assert.equal(
      checking.notRunNote("find_deep", complaints),
      "[find_deep не запустилась: depth — має бути числом, прийшло «швидко»]",
    );
  });

  it("names a required argument that never came", () => {
    const complaints = checking.complaints(tool([parameter({})]), {});

    assert.equal(
      checking.notRunNote("find_deep", complaints),
      "[find_deep не запустилась: depth — обов'язковий, а не прийшов]",
    );
  });

  it("says nothing about a parameter the command runs without and nobody filled", () => {
    assert.deepEqual(
      checking.complaints(
        tool([
          parameter({
            isRequired: false,
          }),
        ]),
        {},
      ),
      [],
    );
  });

  it("holds an enum to the person's own list", () => {
    const only = parameter({
      name: "mode",
      type: "enum",
      values: ["dot", "spec"],
    });

    assert.equal(
      checking.notRunNote(
        "find_deep",
        checking.complaints(tool([only]), {
          mode: "fast",
        }),
      ),
      "[find_deep не запустилась: mode — має бути одним зі списку (dot, spec), прийшло «fast»]",
    );
    assert.deepEqual(
      checking.complaints(tool([only]), {
        mode: "spec",
      }),
      [],
    );
  });

  it("holds a bool to true or false, since that is what the model was asked for", () => {
    const only = parameter({
      name: "bail",
      type: "bool",
    });

    assert.equal(
      checking.notRunNote(
        "find_deep",
        checking.complaints(tool([only]), {
          bail: "може бути",
        }),
      ),
      "[find_deep не запустилась: bail — має бути true або false, прийшло «може бути»]",
    );
    assert.deepEqual(
      checking.complaints(tool([only]), {
        bail: "false",
      }),
      [],
    );
  });

  it("says nothing about a text, because a text is any text", () => {
    assert.deepEqual(
      checking.complaints(
        tool([
          parameter({
            name: "mask",
            type: "text",
          }),
        ]),
        {
          mask: "; rm -rf",
        },
      ),
      [],
    );
  });

  it("gathers every argument that failed, so one answer is enough to mend them all", () => {
    const complaints = checking.complaints(
      tool([
        parameter({}),
        parameter({
          name: "mask",
          type: "text",
          isRequired: true,
        }),
      ]),
      {
        depth: "глибоко",
      },
    );

    assert.equal(complaints.length, 2);
    assert.equal(
      checking.notRunNote("find_deep", complaints),
      "[find_deep не запустилась: depth — має бути числом, прийшло «глибоко»; mask — обов'язковий, а не прийшов]",
    );
  });

  it("says the same refusal to the person without the value the model sent", () => {
    const complaints = checking.complaints(tool([parameter({})]), {
      depth: "швидко",
    });

    assert.equal(checking.refusedLine("find_deep", complaints), "find_deep НЕ ЗАПУСТИЛАСЬ · depth — МАЄ БУТИ ЧИСЛОМ");
  });

  it("keeps the person's own list out of the grey line, however long it is", () => {
    const only = parameter({
      name: "mode",
      type: "enum",
      values: ["dot", "spec"],
    });
    const complaints = checking.complaints(tool([only]), {
      mode: "fast",
    });

    assert.equal(
      checking.refusedLine("find_deep", complaints),
      "find_deep НЕ ЗАПУСТИЛАСЬ · mode — МАЄ БУТИ ОДНИМ ЗІ СПИСКУ",
    );
  });

  it("puts every failed argument in the one line", () => {
    const complaints = checking.complaints(
      tool([
        parameter({}),
        parameter({
          name: "mask",
          type: "text",
          isRequired: true,
        }),
      ]),
      {
        depth: "глибоко",
      },
    );

    assert.equal(
      checking.refusedLine("find_deep", complaints),
      "find_deep НЕ ЗАПУСТИЛАСЬ · depth — МАЄ БУТИ ЧИСЛОМ · mask — ОБОВ'ЯЗКОВИЙ, А НЕ ПРИЙШОВ",
    );
  });
});
