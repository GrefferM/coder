import { describe, expect, it, vi } from "vitest";
import { askProvider, listProviders, saveProviderValue } from "./provider-calls";
import {
  ASK_PROVIDER_CHANNEL,
  LIST_PROVIDERS_CHANNEL,
  SAVE_PROVIDER_ADDRESS_CHANNEL,
  SAVE_PROVIDER_KEY_CHANNEL,
} from "../../../../../contracts";
import { standInBridge } from "../../../testing";
import type { ProviderState } from "../../../interfaces";

const OLLAMA: ProviderState = {
  id: "ollama",
  name: "Ollama",
  kind: "local",
  needs: ["address"],
  takesTools: true,
  customaryAddress: "http://localhost:11434",
  keyHint: null,
  address: null,
  isOff: false,
};

const OPENROUTER: ProviderState = {
  id: "openrouter",
  name: "OpenRouter",
  kind: "remote",
  needs: ["key"],
  takesTools: true,
  customaryAddress: null,
  keyHint: null,
  address: null,
  isOff: false,
};

function machine(answer: unknown) {
  const invoke = vi.fn(async () => answer);

  standInBridge({
    invoke,
  });

  return invoke;
}

function brokenMachine() {
  const invoke = vi.fn(async () => {
    throw new Error("no machine");
  });

  standInBridge({
    invoke,
  });

  return invoke;
}

describe("provider calls", () => {
  it("hands back the providers this machine knows", async () => {
    machine([OLLAMA]);

    expect(await listProviders()).toEqual([OLLAMA]);
  });

  it("takes an unreachable machine as no providers, not as a fall", async () => {
    brokenMachine();

    expect(await listProviders()).toEqual([]);
  });

  it("asks one provider by its own id", async () => {
    const invoke = machine({
      isAnswering: true,
      models: [],
    });

    await askProvider("ollama");

    expect(invoke).toHaveBeenCalledWith(ASK_PROVIDER_CHANNEL, {
      providerId: "ollama",
    });
  });

  it("takes a provider that did not answer as a silence, and says nothing is installed there", async () => {
    // Silence is a provider state, not an app failure: the agent shows «мовчить».
    brokenMachine();

    expect(await askProvider("ollama")).toEqual({
      isAnswering: false,
      models: [],
    });
  });

  it("writes a local provider's address into the store for addresses", async () => {
    // A key and an address go through separate channels.
    const invoke = machine(undefined);

    await saveProviderValue({
      provider: OLLAMA,
      need: "address",
      value: "http://localhost:11434",
    });

    expect(invoke).toHaveBeenCalledWith(SAVE_PROVIDER_ADDRESS_CHANNEL, {
      providerId: "ollama",
      value: "http://localhost:11434",
    });
  });

  it("writes a remote provider's key into the store for keys", async () => {
    const invoke = machine(undefined);

    await saveProviderValue({
      provider: OPENROUTER,
      need: "key",
      value: "sk-secret",
    });

    expect(invoke).toHaveBeenCalledWith(SAVE_PROVIDER_KEY_CHANNEL, {
      providerId: "openrouter",
      value: "sk-secret",
    });
  });

  it("asks the list channel for the list and nothing else", async () => {
    const invoke = machine([]);

    await listProviders();

    expect(invoke).toHaveBeenCalledWith(LIST_PROVIDERS_CHANNEL);
  });
});
