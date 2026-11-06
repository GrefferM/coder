import { useCallback, useEffect, useRef, useState } from "react";
import { spokenParts, spokenWord } from "../../logic";
import { SPEECH_SECTION_ACT, VOICE_NOT_SET_NOTE } from "../../constants";
import type { ReadAloud, ReadAloudHands, SpokenWord } from "../../interfaces";

/** One voice for the whole window: a new reading stops the old one, and nothing is left reading when it goes. */
export function useReadAloud(hands: ReadAloudHands): ReadAloud {
  const [readingId, setReadingId] = useState<string | null>(null);
  const [spoken, setSpoken] = useState<SpokenWord | null>(null);
  /** Held in a ref, so a reading begun under old hands still says its refusal through the current ones. */
  const held = useRef(hands);

  held.current = hands;

  /** Lets go of the reading before this one, so its late end or word touches nothing. */
  const stopPrevious = useRef<() => void>(() => {});

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const stop = useCallback(() => {
    stopPrevious.current();
    window.speechSynthesis.cancel();
    setReadingId(null);
    setSpoken(null);
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

    const parts = spokenParts(text);
    const utterance = new SpeechSynthesisUtterance(parts.spoken);
    /** Whether this reading is still the one standing; one stopped for another neither clears nor lights anything. */
    let isStanding = true;
    const done = () => {
      if (!isStanding) {
        return;
      }

      isStanding = false;
      setReadingId(null);
      setSpoken(null);
    };

    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.onend = done;
    utterance.onerror = done;
    // The voice says which character it reached; the word there is lit in the card.
    utterance.onboundary = (event) => {
      if (isStanding && event.name === "word") {
        setSpoken(spokenWord(parts, event.charIndex));
      }
    };

    window.speechSynthesis.cancel();
    stopPrevious.current();
    stopPrevious.current = () => {
      isStanding = false;
    };
    setReadingId(id);
    setSpoken(null);
    window.speechSynthesis.speak(utterance);
  }, []);

  return {
    readingId,
    spoken,
    read,
    stop,
  };
}
