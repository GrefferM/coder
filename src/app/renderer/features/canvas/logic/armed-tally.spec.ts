import { describe, expect, it } from "vitest";
import { armedTally } from "./armed-tally";
import type { SourcesSaid } from "../interfaces";
import type { ToolGrant } from "../../../interfaces";

const SERVER_ID = "server-1";

function said(commandIds: string[], serverIds: string[]): SourcesSaid {
  return <SourcesSaid>(<unknown>{
    commands: commandIds.map((id) => ({
      id,
      name: id,
    })),
    servers: serverIds.map((id) => ({
      id,
      name: id,
    })),
    looks: {},
  });
}

function ofCommand(commandId: string): ToolGrant {
  return <ToolGrant>(<unknown>{
    id: `grant-${commandId}`,
    source: "command",
    commandId,
    pinned: [],
  });
}

function ofServer(functionName: string): ToolGrant {
  return <ToolGrant>(<unknown>{
    id: `grant-${functionName}`,
    source: "mcp",
    serverId: SERVER_ID,
    functionName,
  });
}

describe("armedTally", () => {
  it("counts every source together, and a declared command as one function", () => {
    // «скільки функцій цьому агентові видано — усіх джерел разом, і команда в цій лічбі одна функція».
    const tally = armedTally(
      [ofCommand("command-1"), ofCommand("command-2"), ofServer("search"), ofServer("read")],
      said(["command-1", "command-2"], [SERVER_ID]),
    );

    expect(tally).toBe(4);
  });

  it("leaves out what points at nothing, because the number counts what can be called", () => {
    const tally = armedTally([ofCommand("command-1"), ofCommand("command-gone")], said(["command-1"], []));

    expect(tally).toBe(1);
  });

  it("counts nothing for an agent armed with nothing, and that is what leaves the key off", () => {
    expect(armedTally([], said([], []))).toBe(0);
  });
});
