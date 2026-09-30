import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { McpCalls } from "./mcp-calls.service";

const SERVER_ID = "99999999-9999-4999-8999-999999999999";
const OTHER_ID = "88888888-8888-4888-8888-888888888888";

function worked() {
  return {
    output: "готово",
    isFailed: false,
  };
}

function wentWrong(said = "немає такого файлу") {
  return {
    output: said,
    isFailed: true,
  };
}

function aCall(functionName: string, callId = "call-1") {
  return {
    callId,
    functionName,
  };
}

describe("McpCalls", () => {
  it("has nothing to say about a server nobody has called", () => {
    // Not «жодна функція не відповіла»: nothing was asked yet.
    const calls = new McpCalls();

    assert.deepEqual(calls.of(SERVER_ID), {
      failedInARow: 0,
      hasWorked: false,
      lastFailure: null,
    });
  });

  it("keeps the call the failure was, because «ПОКАЗАТИ ВИКЛИК» is found by its id and nothing else", () => {
    const calls = new McpCalls();

    calls.noted(
      SERVER_ID,
      {
        callId: "call-7",
        functionName: "browser_navigate",
      },
      wentWrong(),
    );

    assert.equal(calls.of(SERVER_ID).lastFailure?.callId, "call-7");
  });

  it("counts failures one after another, and keeps the last one whole", () => {
    const calls = new McpCalls();

    calls.noted(SERVER_ID, aCall("read_file"), wentWrong());
    calls.noted(SERVER_ID, aCall("list_roots"), wentWrong("сторінки немає"));

    const standing = calls.of(SERVER_ID);

    assert.equal(standing.failedInARow, 2);
    assert.equal(standing.hasWorked, false);
    assert.equal(standing.lastFailure?.functionName, "list_roots");
    // The server's own words are kept as said; the row shows their first line.
    assert.equal(standing.lastFailure?.said, "сторінки немає");
  });

  it("puts the count back to none as soon as one call works", () => {
    // «будь-який вдалий скидає лічбу й смугу»: earlier failures were about a page, not the server.
    const calls = new McpCalls();

    calls.noted(SERVER_ID, aCall("read_file"), wentWrong());
    calls.noted(SERVER_ID, aCall("read_file"), wentWrong());
    calls.noted(SERVER_ID, aCall("read_file"), worked());

    assert.deepEqual(calls.of(SERVER_ID), {
      failedInARow: 0,
      hasWorked: true,
      lastFailure: null,
    });
  });

  it("remembers that a call has worked, even after the ones since it failed", () => {
    // «живий, але жодна функція не відповіла» is said only of the first fact.
    const calls = new McpCalls();

    calls.noted(SERVER_ID, aCall("read_file"), worked());
    calls.noted(SERVER_ID, aCall("read_file"), wentWrong());

    const standing = calls.of(SERVER_ID);

    assert.equal(standing.failedInARow, 1);
    assert.equal(standing.hasWorked, true);
  });

  it("counts each server on its own", () => {
    const calls = new McpCalls();

    calls.noted(SERVER_ID, aCall("read_file"), wentWrong());

    assert.equal(calls.of(SERVER_ID).failedInARow, 1);
    assert.equal(calls.of(OTHER_ID).failedInARow, 0);
  });

  it("forgets everything about a server that was let go", () => {
    // A new connection is a new chance: «перезапуск сервера теж скидає».
    const calls = new McpCalls();

    calls.noted(SERVER_ID, aCall("read_file"), wentWrong());
    calls.forget(SERVER_ID);

    assert.deepEqual(calls.of(SERVER_ID), {
      failedInARow: 0,
      hasWorked: false,
      lastFailure: null,
    });
  });
});
