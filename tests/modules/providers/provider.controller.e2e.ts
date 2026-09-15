import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { ProviderController } from "../../../src/modules/providers/controllers/provider.controller";
import { AskProviderDto, SaveProviderAddressDto, SaveProviderKeyDto } from "../../../src/modules/providers/dto";
import { KNOWN_PROVIDERS } from "../../../src/modules/providers/constants";
import type { ProviderService } from "../../../src/modules/providers/services";

const [KNOWN] = KNOWN_PROVIDERS;

let asked: { name: string; with: unknown }[] = [];

function controller(): ProviderController {
  const service = <ProviderService>(<unknown>{
    list: async () => {
      asked.push({
        name: "list",
        with: null,
      });

      return [];
    },
    ask: async (payload: unknown) => {
      asked.push({
        name: "ask",
        with: payload,
      });

      return {
        isAnswering: true,
        models: [],
      };
    },
    saveKey: async (payload: unknown) => {
      asked.push({
        name: "saveKey",
        with: payload,
      });
    },
    saveAddress: async (payload: unknown) => {
      asked.push({
        name: "saveAddress",
        with: payload,
      });
    },
  });

  return new ProviderController(service);
}

describe("ProviderController", () => {
  beforeEach(() => {
    asked = [];
  });

  it("asks a provider this machine knows whether it answers", async () => {
    const reply = await controller().ask(
      Object.assign(new AskProviderDto(), {
        providerId: KNOWN.id,
      }),
    );

    assert.deepEqual(reply, {
      isAnswering: true,
      models: [],
    });
  });

  it("refuses a provider nobody declared, wherever the name came from", async () => {
    // The list of providers is the app's own; a name from a file or a hand is not a provider.
    await assert.rejects(() =>
      controller().ask(
        Object.assign(new AskProviderDto(), {
          providerId: "нашвидкуруч",
        }),
      ),
    );
    assert.deepEqual(asked, []);
  });

  it("writes a key and an address, each by its own door", async () => {
    const door = controller();

    await door.saveKey(
      Object.assign(new SaveProviderKeyDto(), {
        providerId: KNOWN.id,
        value: "sk-secret",
      }),
    );
    await door.saveAddress(
      Object.assign(new SaveProviderAddressDto(), {
        providerId: KNOWN.id,
        value: "http://localhost:11434",
      }),
    );

    assert.deepEqual(
      asked.map((one) => one.name),
      ["saveKey", "saveAddress"],
    );
  });

  it("lets an empty value through, since that is how a key or an address is taken away", async () => {
    await controller().saveKey(
      Object.assign(new SaveProviderKeyDto(), {
        providerId: KNOWN.id,
        value: "",
      }),
    );

    assert.equal(asked[0].name, "saveKey");
  });

  it("refuses to write anything for a provider nobody declared", async () => {
    await assert.rejects(() =>
      controller().saveKey(
        Object.assign(new SaveProviderKeyDto(), {
          providerId: "нашвидкуруч",
          value: "sk-secret",
        }),
      ),
    );
    await assert.rejects(() =>
      controller().saveAddress(
        Object.assign(new SaveProviderAddressDto(), {
          providerId: "нашвидкуруч",
          value: "http://localhost:11434",
        }),
      ),
    );
    assert.deepEqual(asked, []);
  });

  it("hands back the list without asking for any payload", async () => {
    await controller().list();

    assert.equal(asked[0].name, "list");
  });
});
