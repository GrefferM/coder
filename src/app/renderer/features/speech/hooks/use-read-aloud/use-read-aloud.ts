import { useCallback, useEffect, useRef, useState } from "react";
import { languageSpans, spokenParts, spokenWord } from "../../logic";
import { SPEECH_SECTION_ACT, VOICE_NOT_SET_NOTE, VOICE_RATE_OWN } from "../../constants";
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
    const { voiceName, ukrainianVoiceName, voiceRate, onNote, onOpenSpeech } = held.current;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((one) => one.name === voiceName) ?? null;
    const ukrainianVoice = voices.find((one) => one.name === ukrainianVoiceName) ?? voice;

    // No voice chosen, or the one chosen is gone from this machine: the line says where it is chosen.
    if (voice === null || ukrainianVoice === null) {
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
    const spans = languageSpans(parts.spoken);
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
    // Each run of one language is read by its own voice, one after another; the reading ends with the last of them.
    const utterances = spans.map((span, index) => {
      const spoken = new SpeechSynthesisUtterance(parts.spoken.slice(span.start, span.end));
      const reader = span.isUkrainian ? ukrainianVoice : voice;

      spoken.voice = reader;
      spoken.lang = reader.lang;
      spoken.rate = voiceRate ?? VOICE_RATE_OWN;
      spoken.onerror = done;
      spoken.onend = index === spans.length - 1 ? done : null;
      // The voice says which character of its run it reached; the word there is lit in the card.
      spoken.onboundary = (event) => {
        if (isStanding && event.name === "word") {
          setSpoken(spokenWord(parts, span.start + event.charIndex));
        }
      };

      return spoken;
    });

    window.speechSynthesis.cancel();
    stopPrevious.current();
    stopPrevious.current = () => {
      isStanding = false;
    };
    setReadingId(id);
    setSpoken(null);
    utterances.forEach((utterance) => window.speechSynthesis.speak(utterance));
  }, []);

  return {
    readingId,
    spoken,
    read,
    stop,
  };
}
