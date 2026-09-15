import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { SecretController } from "../../../src/modules/secrets/controllers/secret.controller";
import { RemoveSecretDto, SetSecretDto } from "../../../src/modules/secrets/dto";
import type { SecretService } from "../../../src/modules/secrets/services";

let asked: { name: string; with: unknown }[] = [];

function controller(): SecretController {
  const service = <SecretService>(<unknown>{
    set: async (payload: unknown) => {
      asked.push({
        name: "set",
        with: payload,
      });

      return {
        key: "openrouter",
        hint: "sk-…f31a",
      };
    },
    remove: async (payload: unknown) => {
      asked.push({
        name: "remove",
        with: payload,
      });
    },
    hints: async () => {
      asked.push({
        name: "hints",
        with: null,
      });

      return [];
    },
  });

  return new SecretController(service);
}

describe("SecretController", () => {
  beforeEach(() => {
    asked = [];
  });

  it("writes a secret and answers with its hint, never with the secret", async () => {
    // The key itself never comes back over the boundary; only the few characters that let a person recognise it.
    const hint = await controller().set(
      Object.assign(new SetSecretDto(), {
        key: "openrouter",
        value: "sk-secret",
      }),
    );

    assert.deepEqual(hint, {
      key: "openrouter",
      hint: "sk-…f31a",
    });
  });

  it("asks for every hint without any payload at all", async () => {
    await controller().hints();

    assert.equal(asked[0].name, "hints");
  });

  it("refuses a secret with no name, and one with nothing in it", async () => {
    // An empty key would write a secret nobody can name again; an empty value is the removal, and has its own door.
    await assert.rejects(() =>
      controller().set(
        Object.assign(new SetSecretDto(), {
          key: "",
          value: "sk-secret",
        }),
      ),
    );
    await assert.rejects(() =>
      controller().set(
        Object.assign(new SetSecretDto(), {
          key: "openrouter",
          value: "",
        }),
      ),
    );
    assert.deepEqual(asked, []);
  });

  it("refuses to remove a secret named by nothing", async () => {
    await assert.rejects(() =>
      controller().remove(
        Object.assign(new RemoveSecretDto(), {
          key: "",
        }),
      ),
    );
    assert.deepEqual(asked, []);
  });
});
