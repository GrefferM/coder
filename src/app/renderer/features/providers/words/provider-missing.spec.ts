import { describe, expect, it } from "vitest";
import { providerMissing } from "./provider-missing";
import { PROVIDER_NO_ADDRESS_LABEL, PROVIDER_NO_KEY_LABEL } from "../constants";
import type { ProviderState } from "../../../interfaces";

function aProvider(patch: Partial<ProviderState> = {}): ProviderState {
  return {
    id: "runpod",
    name: "RunPod",
    kind: "remote",
    needs: ["key", "address"],
    takesTools: true,
    customaryAddress: null,
    keyHint: null,
    address: null,
    ...patch,
  };
}

describe("providerMissing", () => {
  it("names both where a provider asks for both and holds neither", () => {
    expect(providerMissing(aProvider())).toEqual([PROVIDER_NO_KEY_LABEL, PROVIDER_NO_ADDRESS_LABEL]);
  });

  it("names the address alone once the key is written", () => {
    expect(
      providerMissing(
        aProvider({
          keyHint: "rpa_lon•••",
        }),
      ),
    ).toEqual([PROVIDER_NO_ADDRESS_LABEL]);
  });

  it("says nothing of a provider holding everything it asked for", () => {
    expect(
      providerMissing(
        aProvider({
          keyHint: "rpa_lon•••",
          address: "https://api.runpod.ai/v2/q7w2e9r4t6y1u3/openai/v1",
        }),
      ),
    ).toEqual([]);
  });

  it("never finds a local provider short of an address: its customary one stands behind the field", () => {
    expect(
      providerMissing(
        aProvider({
          id: "ollama",
          name: "Ollama",
          kind: "local",
          needs: ["address"],
          takesTools: true,
          customaryAddress: "http://localhost:11434",
        }),
      ),
    ).toEqual([]);
  });

  it("looks only at what the provider asked for, so a key-only one is never short of an address", () => {
    expect(
      providerMissing(
        aProvider({
          id: "openrouter",
          name: "OpenRouter",
          needs: ["key"],
          takesTools: true,
          keyHint: "sk-or-v•••",
        }),
      ),
    ).toEqual([]);
  });
});
