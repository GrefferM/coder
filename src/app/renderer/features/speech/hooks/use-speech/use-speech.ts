import { useCallback, useEffect, useRef, useState } from "react";
import { readSpeech, saveSpeech } from "../../api";
import { thrownWords } from "../../../../utils/errors";
import { NOTHING_CHOSEN, SPEECH_SAVE_FAILED_PREFIX } from "../../constants";
import type { SpeechSettings } from "../../../../../../contracts";
import type { MachineVoice, SpeechNote, SpeechState } from "../../interfaces";

/** The OS's voices as they stand now: name and language only. */
function machineVoices(): MachineVoice[] {
  return window.speechSynthesis.getVoices().map((voice) => ({
    name: voice.name,
    lang: voice.lang,
  }));
}

/**
 * What this machine speaks and hears with, read once, and the voices its OS has, told again whenever they change. A
 * change that could not be written is said on the line, and the settings are read again from what the machine holds.
 */
export function useSpeech(onNote: (note: SpeechNote) => void): SpeechState {
  const [settings, setSettings] = useState<SpeechSettings>(NOTHING_CHOSEN);
  const [voices, setVoices] = useState<MachineVoice[]>(machineVoices);
  /** The settings as they stand after the last change, so a change is laid over them and never over an older copy. */
  const held = useRef<SpeechSettings>(NOTHING_CHOSEN);
  /** Held in a ref, so a failure is said through the line as it stands when the write comes back. */
  const told = useRef(onNote);

  told.current = onNote;

  useEffect(() => {
    let isLive = true;

    void readSpeech().then((read) => {
      if (isLive) {
        held.current = read;
        setSettings(read);
      }
    });

    return () => {
      isLive = false;
    };
  }, []);

  // The OS hands its voices over late, and again whenever one is put in or taken out.
  useEffect(() => {
    const tell = () => setVoices(machineVoices());

    window.speechSynthesis.addEventListener("voiceschanged", tell);

    return () => window.speechSynthesis.removeEventListener("voiceschanged", tell);
  }, []);

  const save = useCallback(async (change: Partial<SpeechSettings>) => {
    const next: SpeechSettings = {
      ...held.current,
      ...change,
    };

    held.current = next;
    setSettings(next);

    try {
      await saveSpeech(next);
    } catch (failure) {
      told.current({
        words: `${SPEECH_SAVE_FAILED_PREFIX}${thrownWords(failure)}`,
        act: null,
      });

      const kept = await readSpeech();

      held.current = kept;
      setSettings(kept);
    }
  }, []);

  return {
    settings,
    voices,
    save,
  };
}
