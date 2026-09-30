import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, it } from "node:test";
import { KNOWN_PROVIDERS, UNKNOWN_PROVIDER } from "../constants";
import { ProviderService } from "./provider.service";
import type { ProviderKeyStore } from "../interfaces";

function keyStore(): ProviderKeyStore {
  const held = new Map<string, string>();

  return {
    set: async ({ key, value }) => {
      held.set(key, value);

      return {
        key,
        hint: `${value.slice(0, 7)}•••`,
      };
    },
    remove: async ({ key }) => {
      held.delete(key);
    },
    value: async (key) => held.get(key) ?? null,
    hints: async () =>
      [...held.entries()].map(([key, value]) => ({
        key,
        hint: `${value.slice(0, 7)}•••`,
      })),
  };
}

describe("ProviderService", () => {
  let providerService: ProviderService;

  beforeEach(async () => {
    providerService = new ProviderService(keyStore(), await mkdtemp(path.join(os.tmpdir(), "coder-providers-")));
  });

  it("stands the whole known list, whatever this machine holds", async () => {
    const providers = await providerService.list();

    assert.deepEqual(
      providers.map((provider) => provider.id),
      KNOWN_PROVIDERS.map((provider) => provider.id),
    );
    assert.equal(
      providers.every((provider) => provider.keyHint === null && provider.address === null),
      true,
    );
  });

  it("says a written key by its hint, and never by its value", async () => {
    await providerService.saveKey({
      providerId: "anthropic",
      value: "sk-ant-api03-longvalue4Kd",
    });

    const anthropic = (await providerService.list()).find((provider) => provider.id === "anthropic");

    assert.equal(anthropic?.keyHint, "sk-ant-•••");
  });

  it("takes a key away when what comes in is empty", async () => {
    await providerService.saveKey({
      providerId: "anthropic",
      value: "sk-ant-api03-longvalue4Kd",
    });
    await providerService.saveKey({
      providerId: "anthropic",
      value: "   ",
    });

    const anthropic = (await providerService.list()).find((provider) => provider.id === "anthropic");

    assert.equal(anthropic?.keyHint, null);
  });

  it("keeps a local provider's address in the clear, and offers the customary one beside it", async () => {
    await providerService.saveAddress({
      providerId: "ollama",
      value: "http://10.0.0.4:11434",
    });

    const ollama = (await providerService.list()).find((provider) => provider.id === "ollama");

    assert.equal(ollama?.address, "http://10.0.0.4:11434");
    assert.equal(ollama?.customaryAddress, "http://localhost:11434");
  });

  it("empties an address back to nothing, which means the customary one", async () => {
    await providerService.saveAddress({
      providerId: "ollama",
      value: "http://10.0.0.4:11434",
    });
    await providerService.saveAddress({
      providerId: "ollama",
      value: "",
    });

    const ollama = (await providerService.list()).find((provider) => provider.id === "ollama");

    assert.equal(ollama?.address, null);
  });

  it("answers a local provider's address with the customary one until this machine writes its own", async () => {
    assert.equal(await providerService.addressOf("ollama"), "http://localhost:11434");

    await providerService.saveAddress({
      providerId: "ollama",
      value: "http://10.0.0.4:11434",
    });

    assert.equal(await providerService.addressOf("ollama"), "http://10.0.0.4:11434");
  });

  it("gives a provider that asks for no address none at all — there is nothing there to answer with", async () => {
    assert.equal(await providerService.addressOf("anthropic"), null);
  });

  it("holds both a key and an address for a provider that asks for both, each in its own store", async () => {
    // RunPod is remote, but its endpoint address is the person's own.
    await providerService.saveKey({
      providerId: "runpod",
      value: "rpa_longvalue4Kd",
    });
    await providerService.saveAddress({
      providerId: "runpod",
      value: "https://api.runpod.ai/v2/q7w2e9r4t6y1u3/openai/v1",
    });

    const runpod = (await providerService.list()).find((provider) => provider.id === "runpod");

    assert.deepEqual(runpod?.needs, ["key", "address"]);
    assert.equal(runpod?.keyHint, "rpa_lon•••");
    assert.equal(runpod?.address, "https://api.runpod.ai/v2/q7w2e9r4t6y1u3/openai/v1");
    assert.equal(await providerService.addressOf("runpod"), "https://api.runpod.ai/v2/q7w2e9r4t6y1u3/openai/v1");
  });

  it("offers no customary address where the endpoint is the person's own: an empty field is empty", async () => {
    assert.equal(await providerService.addressOf("runpod"), null);
  });

  it("refuses a key on a provider that asks for none, and an address on one that asks for none", async () => {
    await assert.rejects(
      providerService.saveKey({
        providerId: "ollama",
        value: "sk-ant-api03-longvalue4Kd",
      }),
      new RegExp(UNKNOWN_PROVIDER),
    );
    await assert.rejects(
      providerService.saveAddress({
        providerId: "anthropic",
        value: "http://localhost:11434",
      }),
      new RegExp(UNKNOWN_PROVIDER),
    );
  });

  it("asks a local provider at its address and says what it has installed", async () => {
    const asked: string[] = [];

    globalThis.fetch = (async (url: string) => {
      asked.push(String(url));

      return {
        ok: true,
        json: async () => ({
          models: [
            {
              name: "qwen2.5-coder",
              size: 19_000_000_000,
            },
            {
              name: "llama3.1:8b",
              size: 4_700_000_000,
            },
          ],
        }),
      };
    }) as unknown as typeof fetch;

    const reply = await providerService.ask({
      providerId: "ollama",
    });

    assert.deepEqual(asked, ["http://localhost:11434/api/tags"]);
    assert.equal(reply.isAnswering, true);
    assert.deepEqual(
      reply.models.map((model) => model.name),
      ["qwen2.5-coder", "llama3.1:8b"],
    );
    assert.equal(reply.models[0].sizeBytes, 19_000_000_000);
  });

  it("reads LM Studio's own shape, where a model is named by its id and says no size", async () => {
    globalThis.fetch = (async () => ({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "qwen2.5-coder",
          },
        ],
      }),
    })) as unknown as typeof fetch;

    const reply = await providerService.ask({
      providerId: "lmstudio",
    });

    assert.deepEqual(reply.models, [
      {
        name: "qwen2.5-coder",
        sizeBytes: null,
      },
    ]);
  });

  it("takes a provider that is not running as not answering, which is an answer of its own", async () => {
    globalThis.fetch = (async () => {
      throw new Error("connect ECONNREFUSED 127.0.0.1:11434");
    }) as unknown as typeof fetch;

    assert.deepEqual(
      await providerService.ask({
        providerId: "ollama",
      }),
      {
        isAnswering: false,
        models: [],
      },
    );
  });

  it("refuses to ask any provider that does not run on this machine, address or no address", async () => {
    // Asking for installed models is answered only by a local process.
    await assert.rejects(
      providerService.ask({
        providerId: "anthropic",
      }),
      new RegExp(UNKNOWN_PROVIDER),
    );
    await assert.rejects(
      providerService.ask({
        providerId: "runpod",
      }),
      new RegExp(UNKNOWN_PROVIDER),
    );
  });
});
