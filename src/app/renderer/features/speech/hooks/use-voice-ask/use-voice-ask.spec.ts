import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVoiceAsk } from "./use-voice-ask";
import {
  HEAR_AGAIN_ACT,
  MICROPHONE_DENIED_NOTE,
  MICROPHONE_SETTINGS_ACT,
  NOTHING_HEARD_NOTE,
  SPEECH_NOT_SET_NOTE,
  SPEECH_SECTION_ACT,
} from "../../constants";
import {
  HEAR_SPEECH_CHANNEL,
  OPEN_MICROPHONE_SETTINGS_CHANNEL,
  REFUSAL_SAID_SEPARATOR,
  SPEECH_HEARING_FAILED,
} from "../../../../../../contracts";
import type { SpeechNote, VoiceAskHands } from "../../interfaces";
import { standInBridge } from "../../../../testing";

/** A recorder that records one chunk and says it stopped the moment it is asked to. */
class StandInRecorder {
  readonly mimeType = "audio/webm;codecs=opus";
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => Promise<void>) | null = null;

  start(): void {}

  stop(): void {
    this.ondataavailable?.({
      data: new Blob(["sound"]),
    });
    void this.onstop?.();
  }
}

/** A microphone heard as a steady loud tone: every sample at the top of its swing. */
class StandInListening {
  createAnalyser() {
    return {
      fftSize: 4,
      getByteTimeDomainData: (samples: Uint8Array) => samples.fill(255),
    };
  }

  createMediaStreamSource() {
    return {
      connect: () => {},
    };
  }

  async close(): Promise<void> {}
}

const track = {
  stop: vi.fn(),
};

function hands(patch: Partial<VoiceAskHands> = {}): VoiceAskHands {
  return {
    hearing: {
      providerId: "openai",
      providerName: "OpenAI",
      model: "whisper-1",
    },
    onHeard: vi.fn(),
    onNote: vi.fn(),
    onOpenSpeech: vi.fn(),
    ...patch,
  };
}

/** The microphone given, the provider answering with these words or this refusal. */
function heardAs(answer: string | Error) {
  const invoke = vi.fn(async (channel: string, _payload?: unknown) => {
    if (channel !== HEAR_SPEECH_CHANNEL) {
      return undefined;
    }

    if (answer instanceof Error) {
      throw answer;
    }

    return answer;
  });

  standInBridge({
    invoke,
  });

  return invoke;
}

describe("useVoiceAsk", () => {
  beforeEach(() => {
    vi.stubGlobal("MediaRecorder", StandInRecorder);
    vi.stubGlobal("AudioContext", StandInListening);
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn(async () => ({
          getTracks: () => [track],
        })),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("records on the first press and puts the heard words to the field on the second", async () => {
    const invoke = heardAs("Прогони тести.");
    const onHeard = vi.fn();
    const { result } = renderHook(() =>
      useVoiceAsk(
        hands({
          onHeard,
        }),
      ),
    );

    await act(async () => result.current.press());

    expect(result.current.standing).toBe("recording");

    await act(async () => result.current.press());
    await waitFor(() =>
      expect(onHeard).toHaveBeenCalledWith(
        "Прогони тести.",
        expect.objectContaining({
          mimeType: "audio/webm",
          audio: expect.any(Uint8Array),
        }),
      ),
    );

    const [[, sound]] = invoke.mock.calls;

    expect(sound).toMatchObject({
      mimeType: "audio/webm",
      providerId: "openai",
      model: "whisper-1",
    });
    expect(result.current.standing).toBe("idle");
    expect(track.stop).toHaveBeenCalled();
  });

  it("runs the wave while it records, and the clip keeps the wave and how long it went", async () => {
    heardAs("Прогони тести.");
    const onHeard = vi.fn();
    const { result } = renderHook(() =>
      useVoiceAsk(
        hands({
          onHeard,
        }),
      ),
    );

    await act(async () => result.current.press());
    await waitFor(() => expect(result.current.levels.length).toBeGreaterThan(1));

    expect(result.current.levels.every((level) => level === 1)).toBe(true);

    await act(async () => result.current.press());
    await waitFor(() => expect(onHeard).toHaveBeenCalled());

    const [[, clip]] = onHeard.mock.calls;

    expect(clip.peaks.length).toBeGreaterThan(1);
    expect(clip.durationMs).toBeGreaterThan(0);
    expect(result.current.levels).toEqual([]);
  });

  it("drops a cancelled recording: nobody hears it and nothing reaches the field", async () => {
    const invoke = heardAs("Прогони тести.");
    const onHeard = vi.fn();
    const { result } = renderHook(() =>
      useVoiceAsk(
        hands({
          onHeard,
        }),
      ),
    );

    await act(async () => result.current.press());
    await act(async () => result.current.cancel());

    expect(result.current.standing).toBe("idle");
    expect(invoke).not.toHaveBeenCalled();
    expect(onHeard).not.toHaveBeenCalled();
  });

  it("says recognition is not set, with the way to «Мовлення», and records nothing", async () => {
    heardAs("");
    const onNote = vi.fn();
    const onOpenSpeech = vi.fn();
    const { result } = renderHook(() =>
      useVoiceAsk(
        hands({
          hearing: null,
          onNote,
          onOpenSpeech,
        }),
      ),
    );

    await act(async () => result.current.press());

    expect(result.current.standing).toBe("idle");
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
    expect(onNote).toHaveBeenCalledWith({
      words: SPEECH_NOT_SET_NOTE,
      act: {
        label: SPEECH_SECTION_ACT,
        onPress: onOpenSpeech,
      },
    });
  });

  it("says the microphone is shut, and its act opens the system's page", async () => {
    const invoke = heardAs("");
    const onNote = vi.fn();

    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn(async () => {
          throw new Error("Permission denied");
        }),
      },
      configurable: true,
    });

    const { result } = renderHook(() =>
      useVoiceAsk(
        hands({
          onNote,
        }),
      ),
    );

    await act(async () => result.current.press());

    const [[note]] = onNote.mock.calls;

    expect(note.words).toBe(MICROPHONE_DENIED_NOTE);
    expect(note.act.label).toBe(MICROPHONE_SETTINGS_ACT);

    await act(async () => note.act.onPress());

    expect(invoke).toHaveBeenCalledWith(OPEN_MICROPHONE_SETTINGS_CHANNEL);
  });

  it("says a recording with no words in it, with nothing to do about it", async () => {
    heardAs("");
    const onNote = vi.fn();
    const onHeard = vi.fn();
    const { result } = renderHook(() =>
      useVoiceAsk(
        hands({
          onNote,
          onHeard,
        }),
      ),
    );

    await act(async () => result.current.press());
    await act(async () => result.current.press());
    await waitFor(() =>
      expect(onNote).toHaveBeenCalledWith({
        words: NOTHING_HEARD_NOTE,
        act: null,
      }),
    );

    expect(onHeard).not.toHaveBeenCalled();
  });

  it("names the provider that did not hear, and «ЩЕ РАЗ» sends the same sound again", async () => {
    const invoke = heardAs(new Error(`${SPEECH_HEARING_FAILED}${REFUSAL_SAID_SEPARATOR}Incorrect API key provided`));
    const onNote = vi.fn();
    const { result } = renderHook(() =>
      useVoiceAsk(
        hands({
          onNote,
        }),
      ),
    );

    await act(async () => result.current.press());
    await act(async () => result.current.press());
    await waitFor(() => expect(onNote).toHaveBeenCalledTimes(1));

    const note = <SpeechNote>onNote.mock.calls[0][0];

    expect(note.words).toBe("OpenAI не розпізнав: Incorrect API key provided");
    expect(note.act?.label).toBe(HEAR_AGAIN_ACT);

    await act(async () => note.act?.onPress());
    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(2));

    expect(invoke.mock.calls[1][1]).toBe(invoke.mock.calls[0][1]);
  });

  it("says a failure that is no refusal in its own words, never as recognition not being set", async () => {
    heardAs(new Error("Error invoking remote method 'speech:hear': Error: socket hang up"));
    const onNote = vi.fn();
    const { result } = renderHook(() =>
      useVoiceAsk(
        hands({
          onNote,
        }),
      ),
    );

    await act(async () => result.current.press());
    await act(async () => result.current.press());
    await waitFor(() => expect(onNote).toHaveBeenCalledTimes(1));

    const note = <SpeechNote>onNote.mock.calls[0][0];

    expect(note.words).toBe("OpenAI не розпізнав: socket hang up");
    expect(note.act?.label).toBe(HEAR_AGAIN_ACT);
  });

  it("opens one recording however often the microphone is pressed while the system is asked for it", async () => {
    heardAs("Прогони тести.");

    const { result } = renderHook(() => useVoiceAsk(hands()));

    await act(async () => {
      result.current.press();
      result.current.press();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(result.current.standing).toBe("recording");
  });
});
