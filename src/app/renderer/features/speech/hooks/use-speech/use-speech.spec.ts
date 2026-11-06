import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSpeech } from "./use-speech";
import { SAVE_SPEECH_CHANNEL, SPEECH_SETTINGS_CHANNEL } from "../../../../../../contracts";
import { SPEECH_SAVE_FAILED_PREFIX } from "../../constants";
import { standInBridge } from "../../../../testing";

/** A machine that wrote its voice, answering every save as it is told. */
function machineWithVoice(onSave: () => void = () => {}) {
  const invoke = vi.fn(async (channel: string, _payload?: unknown) => {
    if (channel === SPEECH_SETTINGS_CHANNEL) {
      return {
        voiceName: "Lesya",
      };
    }

    if (channel === SAVE_SPEECH_CHANNEL) {
      onSave();
    }

    return undefined;
  });

  standInBridge({
    invoke,
  });

  return invoke;
}

describe("useSpeech", () => {
  it("reads the voice this machine wrote", async () => {
    machineWithVoice();

    const { result } = renderHook(() => useSpeech(vi.fn()));

    await waitFor(() => expect(result.current.settings.voiceName).toBe("Lesya"));
  });

  it("writes a chosen voice and stands on it", async () => {
    const invoke = machineWithVoice();
    const { result } = renderHook(() => useSpeech(vi.fn()));

    await waitFor(() => expect(result.current.settings.voiceName).toBe("Lesya"));
    await act(async () => {
      await result.current.save({
        voiceName: "Milena",
      });
    });

    expect(invoke).toHaveBeenLastCalledWith(SAVE_SPEECH_CHANNEL, {
      voiceName: "Milena",
    });
    expect(result.current.settings.voiceName).toBe("Milena");
  });

  it("says a change the machine refused, and stands again on what the machine holds", async () => {
    const onNote = vi.fn();

    machineWithVoice(() => {
      throw new Error("Error invoking remote method 'speech:save': Error: voiceName must be a string");
    });

    const { result } = renderHook(() => useSpeech(onNote));

    await waitFor(() => expect(result.current.settings.voiceName).toBe("Lesya"));
    await act(async () => {
      await result.current.save({
        voiceName: "Milena",
      });
    });

    expect(onNote).toHaveBeenCalledWith({
      words: `${SPEECH_SAVE_FAILED_PREFIX}voiceName must be a string`,
      act: null,
    });
    expect(result.current.settings.voiceName).toBe("Lesya");
  });
});
