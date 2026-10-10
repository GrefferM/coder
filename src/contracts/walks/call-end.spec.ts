import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { callEnd } from "./call-end";
import type { TurnCall } from "../runs/turn-call.interface";

function call(patch: Partial<TurnCall>): TurnCall {
  return {
    id: "call-1",
    source: "command",
    name: "find_deep",
    arguments: {},
    pinned: [],
    line: "",
    output: "",
    refusal: "",
    exitCode: null,
    serverId: null,
    serverName: "",
    isFailed: false,
    startedAt: 1,
    endedAt: 2,
    ...patch,
  };
}

describe("callEnd · a call asked of a server", () => {
  it("calls a server's «ні» its own end, since it neither ran nor was refused by us", () => {
    // The function exists and the server answered: «refused» is our check's word, «ran» has a code.
    assert.equal(
      callEnd(
        call({
          serverId: "server-1",
          serverName: "playwright-mcp",
          isFailed: true,
          output: "browser_click: ref=e17 not found on page",
        }),
      ),
      "saidNo",
    );
  });

  it("calls a server that answered a call that ran, code or no code", () => {
    assert.equal(
      callEnd(
        call({
          serverId: "server-1",
          serverName: "playwright-mcp",
          isFailed: false,
          output: "### Page snapshot",
        }),
      ),
      "ran",
    );
  });

  it("keeps our own refusal ahead of everything: nothing was asked of anybody", () => {
    assert.equal(
      callEnd(
        call({
          serverId: "server-1",
          serverName: "playwright-mcp",
          isFailed: true,
          refusal: "Не вистачає аргументу",
        }),
      ),
      "refused",
    );
  });
});

describe("callEnd", () => {
  it("calls a call that ran a call that ran, whatever code it came back with", () => {
    assert.equal(
      callEnd(
        call({
          line: "find .",
          exitCode: 0,
          serverId: null,
          serverName: "",
          isFailed: false,
        }),
      ),
      "ran",
    );
    assert.equal(
      callEnd(
        call({
          line: "find .",
          exitCode: 127,
          serverId: null,
          serverName: "",
          isFailed: false,
        }),
      ),
      "ran",
    );
  });

  it("calls a call the check stopped refused, since no line of it ever ran", () => {
    assert.equal(
      callEnd(
        call({
          refusal: "[find_deep не запустилась: depth — має бути числом]",
        }),
      ),
      "refused",
    );
  });
});
