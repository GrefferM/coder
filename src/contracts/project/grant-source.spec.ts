import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { handleOf, namesFunction, pointsAt, sourceOf } from "./grant-source";
import type { ToolGrant } from "./tool-grant.type";

const COMMAND_ID = "11111111-1111-4111-8111-111111111111";
const SERVER_ID = "22222222-2222-4222-8222-222222222222";

function aCommandGrant(): ToolGrant {
  return {
    id: "grant-1",
    source: "command",
    commandId: COMMAND_ID,
    pinned: [],
  };
}

function aServerGrant(functionName = "pulls.create"): ToolGrant {
  return {
    id: "grant-2",
    source: "mcp",
    serverId: SERVER_ID,
    functionName,
  };
}

describe("sourceOf", () => {
  it("gives a command's grant the command's own id and no function", () => {
    assert.deepEqual(sourceOf(aCommandGrant()), {
      kind: "command",
      id: COMMAND_ID,
      functionName: null,
    });
  });

  it("gives a server's grant the server's id and the name the server gave the function", () => {
    assert.deepEqual(sourceOf(aServerGrant()), {
      kind: "mcp",
      id: SERVER_ID,
      functionName: "pulls.create",
    });
  });
});

describe("sourceOf a system command", () => {
  it("gives a system grant its command's name as the id and no function", () => {
    assert.deepEqual(
      sourceOf({
        id: "grant-3",
        source: "system",
        command: "pass_to",
      }),
      {
        kind: "system",
        id: "pass_to",
        functionName: null,
      },
    );
  });

  it("names a system command by its kind and name", () => {
    assert.equal(
      handleOf(
        sourceOf({
          id: "grant-3",
          source: "system",
          command: "finish_here",
        }),
      ),
      "system:finish_here",
    );
  });
});

describe("pointsAt", () => {
  it("answers for a command by the command's id", () => {
    assert.equal(pointsAt(aCommandGrant(), COMMAND_ID), true);
    assert.equal(pointsAt(aCommandGrant(), SERVER_ID), false);
  });

  it("answers for a server's function by the server's id, whichever function it is", () => {
    assert.equal(pointsAt(aServerGrant(), SERVER_ID), true);
    assert.equal(pointsAt(aServerGrant("pulls.list"), SERVER_ID), true);
  });
});

describe("namesFunction", () => {
  it("takes the server and the name together, since two servers may hand over one name", () => {
    assert.equal(namesFunction(aServerGrant(), SERVER_ID, "pulls.create"), true);
    assert.equal(namesFunction(aServerGrant(), SERVER_ID, "pulls.list"), false);
    assert.equal(namesFunction(aServerGrant(), COMMAND_ID, "pulls.create"), false);
  });

  it("is never a command's, which is one whole thing and names no function", () => {
    assert.equal(namesFunction(aCommandGrant(), COMMAND_ID, "pulls.create"), false);
  });
});

describe("handleOf", () => {
  it("names a command by its id alone, since a command is one whole thing", () => {
    assert.equal(handleOf(sourceOf(aCommandGrant())), `command:${COMMAND_ID}`);
  });

  it("names a server's function by the server and the name together", () => {
    assert.equal(handleOf(sourceOf(aServerGrant())), `mcp:${SERVER_ID}:pulls.create`);
  });

  it("tells two functions of one server apart", () => {
    assert.notEqual(handleOf(sourceOf(aServerGrant())), handleOf(sourceOf(aServerGrant("pulls.list"))));
  });

  it("answers the same for a source that is no grant at all, which is what a picker's row is", () => {
    assert.equal(
      handleOf({
        kind: "mcp",
        id: SERVER_ID,
        functionName: "pulls.create",
      }),
      handleOf(sourceOf(aServerGrant())),
    );
  });
});
