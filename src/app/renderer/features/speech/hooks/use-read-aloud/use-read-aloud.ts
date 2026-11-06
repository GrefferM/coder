import { useCallback, useEffect, useRef, useState } from "react";
import { spokenText } from "../../logic";
import { SPEECH_SECTION_ACT, VOICE_NOT_SET_NOTE } from "../../constants";
import type { ReadAloud, ReadAloudHands } from "../../interfaces";

/** One voice for the whole window: a new reading stops the old one, and nothing is left reading when it goes. */
export function useReadAloud(hands: ReadAloudHands): ReadAloud {
  const [readingId, setReadingId] = useState<string | null>(null);
  /** Held in a ref, so a reading begun under old hands still says its refusal through the current ones. */
  const held = useRef(hands);

  held.current = hands;

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setReadingId(null);
  }, []);

  const read = useCallback((id: string, text: string) => {
    const { voiceName, onNote, onOpenSpeech } = held.current;
    const voice = window.speechSynthesis.getVoices().find((one) => one.name === voiceName) ?? null;

    // No voice chosen, or the one chosen is gone from this machine: the line says where it is chosen.
    if (voice === null) {
      onNote({
        words: VOICE_NOT_SET_NOTE,
        act: {
          label: SPEECH_SECTION_ACT,
          onPress: onOpenSpeech,
        },
      });

      return;
    }

    const utterance = new SpeechSynthesisUtterance(spokenText(text));
    // The end of a reading clears only its own mark; one stopped for another leaves the new one standing.
    const done = () => setReadingId((standing) => (standing === id ? null : standing));

    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.onend = done;
    utterance.onerror = done;

    window.speechSynthesis.cancel();
    setReadingId(id);
    window.speechSynthesis.speak(utterance);
  }, []);

  return {
    readingId,
    read,
    stop,
  };
}
