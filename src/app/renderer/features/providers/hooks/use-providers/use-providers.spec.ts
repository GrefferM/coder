import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useProviders } from "./use-providers";
import {
  ASK_PROVIDER_CHANNEL,
  LIST_PROVIDERS_CHANNEL,
  SAVE_PROVIDER_ADDRESS_CHANNEL,
  SAVE_PROVIDER_KEY_CHANNEL,
} from "../../../../../../contracts";
import { PROVIDER_ASKED_EVERY_MS } from "../../constants";
import type { ProviderState } from "../../../../interfaces";
import { standInBridge } from "../../../../testing";

const OLLAMA: ProviderState = {
  id: "ollama",
  name: "Ollama",
  kind: "local",
  needs: ["address"],
  takesTools: true,
  customaryAddress: "http://localhost:11434",
  keyHint: null,
  address: null,
};

const OPENROUTER: ProviderState = {
  id: "openrouter",
  name: "OpenRouter",
  kind: "remote",
  needs: ["key"],
  takesTools: true,
  customaryAddress: null,
  keyHint: "sk-or",
  address: null,
};

const RUNPOD: ProviderState = {
  id: "runpod",
  name: "RunPod",
  kind: "remote",
  needs: ["key", "address"],
  takesTools: true,
  customaryAddress: null,
  keyHint: null,
  address: null,
};

const INSTALLED = [
  {
    name: "qwen2.5-coder",
    sizeBytes: null,
  },
];

function held() {
  const invoke = vi.fn(async (channel: string) => {
    if (channel === LIST_PROVIDERS_CHANNEL) {
      return [OLLAMA, OPENROUTER];
    }

    return channel === ASK_PROVIDER_CHANNEL
      ? {
          isAnswering: true,
          models: INSTALLED,
        }
      : undefined;
  });

  standInBridge({
    invoke: invoke,
  });

  return invoke;
}

/** A hook standing on the answer its one local provider gave when the list arrived. */
async function asked() {
  const invoke = held();
  const { result } = renderHook(() => useProviders());

  await waitFor(() => expect(result.current.answers[OLLAMA.id]?.isAnswering).toBe(true));

  return {
    invoke,
    result,
  };
}

describe("useProviders", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("asks every local provider again on its own beat, without saying it is asking", async () => {
    // The clock is held before mount, since the mount's effect starts the beat.
    vi.useFakeTimers();

    const invoke = held();
    const { result } = renderHook(() => useProviders());

    // The list arrives over the bridge, and its ask goes first.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    invoke.mockClear();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(PROVIDER_ASKED_EVERY_MS);
    });

    expect(invoke).toHaveBeenCalledWith(ASK_PROVIDER_CHANNEL, {
      providerId: OLLAMA.id,
    });
    expect(result.current.askingIds).toEqual([]);
  });

  it("asks every local provider the moment the list arrives, and no remote one", async () => {
    const { invoke, result } = await asked();

    expect(invoke.mock.calls.filter(([channel]) => channel === ASK_PROVIDER_CHANNEL)).toHaveLength(1);
    expect(result.current.answers[OPENROUTER.id]).toBeUndefined();
  });

  it("writes down the silence a turn heard, keeping the list the provider last gave", async () => {
    const { result } = await asked();

    act(() => result.current.heard(OLLAMA.id, false));

    expect(result.current.answers[OLLAMA.id]?.isAnswering).toBe(false);
    expect(result.current.answers[OLLAMA.id]?.models).toEqual(INSTALLED);
  });

  it("asks the provider again when a turn heard it answer after a silence", async () => {
    const { invoke, result } = await asked();

    act(() => result.current.heard(OLLAMA.id, false));
    invoke.mockClear();
    act(() => result.current.heard(OLLAMA.id, true));

    await waitFor(() =>
      expect(invoke).toHaveBeenCalledWith(ASK_PROVIDER_CHANNEL, {
        providerId: OLLAMA.id,
      }),
    );
    await waitFor(() => expect(result.current.answers[OLLAMA.id]?.isAnswering).toBe(true));
  });

  it("asks nothing when a turn heard what the app already knows", async () => {
    const { invoke, result } = await asked();

    invoke.mockClear();
    act(() => result.current.heard(OLLAMA.id, true));

    expect(invoke).not.toHaveBeenCalled();
  });

  it("stays the one callback, so a turn asked before the list arrived still says what it heard", async () => {
    const invoke = held();
    const { result } = renderHook(() => useProviders());
    // The first render has no providers, and holds `heard` from then on.
    const first = result.current.heard;

    await waitFor(() => expect(result.current.answers[OLLAMA.id]?.isAnswering).toBe(true));
    expect(result.current.heard).toBe(first);

    act(() => first(OLLAMA.id, false));

    expect(result.current.answers[OLLAMA.id]?.isAnswering).toBe(false);
    expect(invoke).toHaveBeenCalled();
  });

  it("says nothing about a remote provider, which is never asked at all", async () => {
    const { result } = await asked();

    act(() => result.current.heard(OPENROUTER.id, false));

    expect(result.current.answers[OPENROUTER.id]).toBeUndefined();
  });

  it("writes both of the things a provider asked for, each into its own store", async () => {
    // One press fills two stores (key secret, address not) and neither is guessed.
    const invoke = held();
    const { result } = renderHook(() => useProviders());

    await waitFor(() => expect(result.current.providers).toHaveLength(2));

    await act(async () => {
      await result.current.save(RUNPOD, {
        key: "rpa_longvalue4Kd",
        address: "https://api.runpod.ai/v2/q7w2e9r4t6y1u3/openai/v1",
      });
    });

    expect(invoke).toHaveBeenCalledWith(SAVE_PROVIDER_KEY_CHANNEL, {
      providerId: "runpod",
      value: "rpa_longvalue4Kd",
    });
    expect(invoke).toHaveBeenCalledWith(SAVE_PROVIDER_ADDRESS_CHANNEL, {
      providerId: "runpod",
      value: "https://api.runpod.ai/v2/q7w2e9r4t6y1u3/openai/v1",
    });
  });

  it("writes nothing for a field nobody touched, so a key kept is not a key rewritten", async () => {
    const invoke = held();
    const { result } = renderHook(() => useProviders());

    await waitFor(() => expect(result.current.providers).toHaveLength(2));

    await act(async () => {
      await result.current.save(RUNPOD, {
        key: null,
        address: "https://api.runpod.ai/v2/q7w2e9r4t6y1u3/openai/v1",
      });
    });

    expect(invoke).not.toHaveBeenCalledWith(SAVE_PROVIDER_KEY_CHANNEL, expect.anything());
  });
});
