import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useReadAloud } from "./use-read-aloud";
import { SPEECH_SECTION_ACT, VOICE_NOT_SET_NOTE } from "../../constants";
import type { ReadAloudHands } from "../../interfaces";

const LESYA = <SpeechSynthesisVoice>(<unknown>{
  name: "Lesya",
  lang: "uk-UA",
});

const SAMANTHA = <SpeechSynthesisVoice>(<unknown>{
  name: "Samantha",
  lang: "en-US",
});

/** The OS's synthesis with one voice, keeping what it was asked to read. */
function synthesisWithLesya() {
  const spoken: SpeechSynthesisUtterance[] = [];

  vi.spyOn(window.speechSynthesis, "getVoices").mockReturnValue([LESYA, SAMANTHA]);
  vi.spyOn(window.speechSynthesis, "speak").mockImplementation((utterance) => {
    spoken.push(utterance);
  });

  const cancel = vi.spyOn(window.speechSynthesis, "cancel");

  return {
    spoken,
    cancel,
  };
}

function hands(patch: Partial<ReadAloudHands> = {}): ReadAloudHands {
  return {
    voiceName: "Lesya",
    ukrainianVoiceName: null,
    voiceRate: null,
    onNote: vi.fn(),
    onOpenSpeech: vi.fn(),
    ...patch,
  };
}

describe("useReadAloud", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads an answer's words with the chosen voice, the code left out, and marks that message as read", () => {
    const { spoken } = synthesisWithLesya();
    const { result } = renderHook(() => useReadAloud(hands()));

    act(() => result.current.read("message-1", "Додав кеш.\n```\nconst a = 1;\n```"));

    const [utterance] = spoken;

    expect(result.current.readingId).toBe("message-1");
    expect(utterance.voice).toBe(LESYA);
    expect(utterance.text).toBe("Додав кеш.\n.");
  });

  it("reads at the pace chosen, and at the voice's own where none is", () => {
    const { spoken } = synthesisWithLesya();
    const { result, rerender } = renderHook((held: ReadAloudHands) => useReadAloud(held), {
      initialProps: hands({
        voiceRate: 1.3,
      }),
    });

    act(() => result.current.read("answer-1", "Hello there."));
    rerender(hands());
    act(() => result.current.read("answer-2", "Hello again."));

    expect(spoken.map((utterance) => utterance.rate)).toEqual([1.3, 1]);
  });

  it("reads Ukrainian sentences with the Ukrainian voice and the rest with the voice chosen, in order", () => {
    const { spoken } = synthesisWithLesya();
    const { result } = renderHook(() =>
      useReadAloud(
        hands({
          voiceName: "Samantha",
          ukrainianVoiceName: "Lesya",
        }),
      ),
    );

    act(() => result.current.read("answer-1", "I went to the shop. Помилка в часі дієслів."));

    expect(spoken.map((utterance) => [utterance.voice?.name, utterance.text.trim()])).toEqual([
      ["Samantha", "I went to the shop."],
      ["Lesya", "Помилка в часі дієслів."],
    ]);
    expect(result.current.readingId).toBe("answer-1");

    act(() => spoken[0].onend?.(<SpeechSynthesisEvent>(<unknown>{})));

    expect(result.current.readingId).toBe("answer-1");

    act(() => spoken[1].onend?.(<SpeechSynthesisEvent>(<unknown>{})));

    expect(result.current.readingId).toBeNull();
  });

  it("lets go of the mark when the reading ends by itself", () => {
    const { spoken } = synthesisWithLesya();
    const { result } = renderHook(() => useReadAloud(hands()));

    act(() => result.current.read("message-1", "Готово."));
    act(() => spoken[0].onend?.(<SpeechSynthesisEvent>(<unknown>{})));

    expect(result.current.readingId).toBeNull();
  });

  it("keeps one voice: a second card stops the first, and the first one's end leaves the second marked", () => {
    const { spoken, cancel } = synthesisWithLesya();
    const { result } = renderHook(() => useReadAloud(hands()));

    act(() => result.current.read("message-1", "Перша."));
    act(() => result.current.read("message-2", "Друга."));
    act(() => spoken[0].onend?.(<SpeechSynthesisEvent>(<unknown>{})));

    expect(cancel).toHaveBeenCalledTimes(2);
    expect(result.current.readingId).toBe("message-2");
  });

  it("says on the line that no voice is chosen, with the way to «Мовлення», and reads nothing", () => {
    const { spoken } = synthesisWithLesya();
    const onNote = vi.fn();
    const onOpenSpeech = vi.fn();
    const { result } = renderHook(() =>
      useReadAloud(
        hands({
          voiceName: null,
          onNote,
          onOpenSpeech,
        }),
      ),
    );

    act(() => result.current.read("message-1", "Готово."));

    expect(spoken).toEqual([]);
    expect(result.current.readingId).toBeNull();
    expect(onNote).toHaveBeenCalledWith({
      words: VOICE_NOT_SET_NOTE,
      act: {
        label: SPEECH_SECTION_ACT,
        onPress: onOpenSpeech,
      },
    });
  });

  it("stops a reading when asked, and leaves nothing reading when it goes", () => {
    const { cancel } = synthesisWithLesya();
    const { result, unmount } = renderHook(() => useReadAloud(hands()));

    act(() => result.current.read("message-1", "Готово."));
    act(() => result.current.stop());

    expect(result.current.readingId).toBeNull();

    cancel.mockClear();
    unmount();

    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("follows the word the voice reaches, and lets it go when the reading ends", () => {
    const { spoken } = synthesisWithLesya();
    const { result } = renderHook(() => useReadAloud(hands()));

    act(() => result.current.read("message-1", "Додав кеш."));
    act(() =>
      spoken[0].onboundary?.(<SpeechSynthesisEvent>(<unknown>{
        name: "word",
        charIndex: 6,
      })),
    );

    expect(result.current.spoken).toEqual({
      start: 6,
      end: 10,
      ratio: 0.6,
    });

    act(() => spoken[0].onend?.(<SpeechSynthesisEvent>(<unknown>{})));

    expect(result.current.spoken).toBeNull();
  });

  it("lights no word of a reading another one has replaced", () => {
    const { spoken } = synthesisWithLesya();
    const { result } = renderHook(() => useReadAloud(hands()));

    act(() => result.current.read("message-1", "Перша відповідь."));
    act(() => result.current.read("message-2", "Друга."));
    act(() =>
      spoken[0].onboundary?.(<SpeechSynthesisEvent>(<unknown>{
        name: "word",
        charIndex: 6,
      })),
    );

    expect(result.current.readingId).toBe("message-2");
    expect(result.current.spoken).toBeNull();
  });
});
