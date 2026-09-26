import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Refusal } from "../../../utils/refusals";
import { registerIpcChannels } from "./register-ipc-channels";
import type { IpcHandleFn } from "./interfaces";

describe("registerIpcChannels", () => {
  it("registers every channel in the map through the given handle function", () => {
    const registeredChannels: string[] = [];
    const handle: IpcHandleFn = (channel) => {
      registeredChannels.push(channel);
    };
    const controller = {
      value: 42,
    };

    registerIpcChannels(
      controller,
      {
        "test:one": async () => null,
        "test:two": async () => null,
      },
      handle,
    );

    assert.deepStrictEqual(registeredChannels.sort(), ["test:one", "test:two"]);
  });

  it("forwards a channel's own call to its handler, bound to the controller and the given payload", async () => {
    let registeredListener: ((...args: unknown[]) => Promise<unknown> | unknown) | undefined;
    const handle: IpcHandleFn = (_channel, listener) => {
      registeredListener = listener;
    };
    const controller = {
      value: 42,
    };
    const handler = async (ctrl: typeof controller, payload: unknown) => `${ctrl.value}:${payload}`;

    registerIpcChannels(
      controller,
      {
        "test:one": handler,
      },
      handle,
    );
    const result = await registeredListener?.({}, "payload");

    assert.deepStrictEqual(result, {
      value: "42:payload",
      refusal: null,
      failure: null,
    });
  });

  it("answers a refusal by name, without reporting it anywhere", async () => {
    let registeredListener: ((...args: unknown[]) => Promise<unknown> | unknown) | undefined;
    const handle: IpcHandleFn = (_channel, listener) => {
      registeredListener = listener;
    };

    registerIpcChannels(
      {},
      {
        "test:one": async () => {
          throw new Refusal("PROJECT_NOT_FOUND");
        },
      },
      handle,
    );

    assert.deepStrictEqual(await registeredListener?.({}, null), {
      value: null,
      refusal: "PROJECT_NOT_FOUND",
      failure: null,
    });
  });

  it("lets a refusal carry one thing more than its name, in the message after the code", async () => {
    let registeredListener: ((...args: unknown[]) => Promise<unknown> | unknown) | undefined;
    const handle: IpcHandleFn = (_channel, listener) => {
      registeredListener = listener;
    };

    registerIpcChannels(
      {},
      {
        "test:one": async () => {
          throw new Refusal("PROJECT_FILE_BROKEN", '{"trail":[],"field":"name","rule":"isNotEmpty"}');
        },
      },
      handle,
    );

    assert.deepStrictEqual(await registeredListener?.({}, null), {
      value: null,
      refusal: 'PROJECT_FILE_BROKEN :: {"trail":[],"field":"name","rule":"isNotEmpty"}',
      failure: null,
    });
  });

  it("answers a fault of its own with words, keeping the refusal empty", async () => {
    let registeredListener: ((...args: unknown[]) => Promise<unknown> | unknown) | undefined;
    const handle: IpcHandleFn = (_channel, listener) => {
      registeredListener = listener;
    };
    const said: unknown[] = [];
    const reported = console.error;

    console.error = (...parts: unknown[]) => said.push(parts);

    registerIpcChannels(
      {},
      {
        "test:one": async () => {
          throw new Error("the database is on fire");
        },
      },
      handle,
    );

    const answer = await registeredListener?.({}, null);

    console.error = reported;

    assert.deepStrictEqual(answer, {
      value: null,
      refusal: null,
      failure: "the database is on fire",
    });
    assert.equal(said.length, 1);
  });

  it("writes the fault as one block and never the object it came in", async () => {
    let registeredListener: ((...args: unknown[]) => Promise<unknown> | unknown) | undefined;
    const handle: IpcHandleFn = (_channel, listener) => {
      registeredListener = listener;
    };
    const said: unknown[][] = [];
    const reported = console.error;

    console.error = (...parts: unknown[]) => said.push(parts);

    registerIpcChannels(
      {},
      {
        "test:one": async () => {
          throw Object.assign(new Error("the provider said no"), {
            headers: {
              "set-cookie": "секрет",
            },
          });
        },
      },
      handle,
    );

    await registeredListener?.({}, null);

    console.error = reported;

    // A library's error object carries the provider's headers and cookies; a terminal is not for those.
    assert.equal(
      said[0].every((part) => typeof part === "string"),
      true,
    );
    assert.equal(
      said[0].some((part) => String(part).includes("секрет")),
      false,
    );
  });
});
