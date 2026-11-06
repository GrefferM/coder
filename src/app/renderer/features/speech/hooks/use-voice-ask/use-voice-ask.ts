import { useCallback, useEffect, useRef, useState } from "react";
import { hearSpeech, openMicrophoneSettings } from "../../api";
import { recordingType, refusalParts, soundLevel, wavePeaks } from "../../logic";
import { hearingFailedWords } from "../../words";
import { errorMessage, providerWords } from "../../../../utils/errors";
import { SPEECH_HEARING_FAILED, SPEECH_NOT_SET } from "../../../../../../contracts";
import {
  HEAR_AGAIN_ACT,
  MICROPHONE_DENIED_NOTE,
  MICROPHONE_SETTINGS_ACT,
  NOTHING_HEARD_NOTE,
  SPEECH_NOT_SET_NOTE,
  SPEECH_SECTION_ACT,
  CLIP_BARS,
  LEVEL_EVERY_MS,
  LIVE_BARS,
} from "../../constants";
import type { HeardSound } from "../../../../../../contracts";
import type { HeardClip, SpeechNote, VoiceAsk, VoiceAskHands, VoiceStanding } from "../../interfaces";

/**
 * A question said rather than typed (4j): the microphone records, the provider hears, and the words go to the field —
 * never further. Refusals go to the app's line; the field is not touched by any of them.
 */
export function useVoiceAsk(hands: VoiceAskHands): VoiceAsk {
  const [standing, setStanding] = useState<VoiceStanding>("idle");
  const [startedAt, setStartedAt] = useState(0);
  /** The latest moments of the recording being made, for the running wave. */
  const [levels, setLevels] = useState<number[]>([]);
  /** Held in a ref, so words heard after a re-render reach the field as it stands then. */
  const held = useRef(hands);
  /** The recording being made; `null` once it is ended or dropped. */
  const recorder = useRef<MediaRecorder | null>(null);
  /** The microphone is being asked for; a second press meanwhile opens no second recording. */
  const isOpening = useRef(false);
  /** Every moment of the recording being made, for the wave its clip keeps. */
  const heardLevels = useRef<number[]>([]);

  held.current = hands;

  // A recording left running when the field goes is dropped, and the microphone let go.
  useEffect(
    () => () => {
      const made = recorder.current;

      recorder.current = null;
      made?.stop();
    },
    [],
  );

  /**
   * The note of a recording that was not heard: what is missing leads to the providers; anything else is said in the
   * words it came with, and «ЩЕ РАЗ» sends the same sound again.
   */
  const failureNote = useCallback((failure: unknown, again: () => void): SpeechNote => {
    const message = errorMessage(failure);
    const { code, said } = refusalParts(message);
    const { hearing, onOpenSpeech } = held.current;

    if (code === SPEECH_NOT_SET) {
      return {
        words: SPEECH_NOT_SET_NOTE,
        act: {
          label: SPEECH_SECTION_ACT,
          onPress: onOpenSpeech,
        },
      };
    }

    return {
      words: hearingFailedWords(
        hearing?.providerName ?? "",
        code === SPEECH_HEARING_FAILED ? said : providerWords(message),
      ),
      act: {
        label: HEAR_AGAIN_ACT,
        onPress: again,
      },
    };
  }, []);

  const hear = useCallback(
    async (sound: HeardSound, clip: HeardClip) => {
      setStanding("hearing");

      let words: string;

      try {
        words = await hearSpeech(sound);
      } catch (failure) {
        setStanding("idle");
        held.current.onNote(failureNote(failure, () => void hear(sound, clip)));

        return;
      }

      setStanding("idle");

      if (words === "") {
        held.current.onNote({
          words: NOTHING_HEARD_NOTE,
          act: null,
        });

        return;
      }

      held.current.onHeard(words, clip);
    },
    [failureNote],
  );

  const start = useCallback(async () => {
    const { hearing, onNote, onOpenSpeech } = held.current;

    if (hearing === null) {
      onNote({
        words: SPEECH_NOT_SET_NOTE,
        act: {
          label: SPEECH_SECTION_ACT,
          onPress: onOpenSpeech,
        },
      });

      return;
    }

    if (isOpening.current) {
      return;
    }

    let stream: MediaStream;

    isOpening.current = true;

    // A microphone the system keeps shut is the system's answer, said on the line with the way to its page.
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch {
      isOpening.current = false;

      onNote({
        words: MICROPHONE_DENIED_NOTE,
        act: {
          label: MICROPHONE_SETTINGS_ACT,
          onPress: () => void openMicrophoneSettings(),
        },
      });

      return;
    }

    const made = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    const listening = new AudioContext();
    const meter = listening.createAnalyser();
    const samples = new Uint8Array(meter.fftSize);
    const begun = Date.now();

    listening.createMediaStreamSource(stream).connect(meter);
    heardLevels.current = [];

    // The microphone's loudness is taken while it records; the wave runs on it.
    const metering = window.setInterval(() => {
      meter.getByteTimeDomainData(samples);
      heardLevels.current.push(soundLevel(samples));
      setLevels(heardLevels.current.slice(-LIVE_BARS));
    }, LEVEL_EVERY_MS);

    made.ondataavailable = (event) => chunks.push(event.data);
    made.onstop = async () => {
      window.clearInterval(metering);
      void listening.close();
      stream.getTracks().forEach((track) => track.stop());
      setLevels([]);

      // A recording dropped by «СКАСУВАТИ» or by the field going is heard by nobody.
      if (recorder.current !== made) {
        return;
      }

      recorder.current = null;

      const recorded = new Blob(chunks);
      const audio = new Uint8Array(await recorded.arrayBuffer());
      const mimeType = recordingType(made.mimeType);

      await hear(
        {
          audio,
          mimeType,
          providerId: hearing.providerId,
          model: hearing.model,
        },
        {
          id: crypto.randomUUID(),
          audio,
          mimeType,
          durationMs: Date.now() - begun,
          peaks: wavePeaks(heardLevels.current, CLIP_BARS),
        },
      );
    };

    isOpening.current = false;
    recorder.current = made;
    made.start();
    setStartedAt(begun);
    setStanding("recording");
  }, [hear]);

  const press = useCallback(() => {
    if (standing === "hearing") {
      return;
    }

    if (standing === "recording") {
      recorder.current?.stop();

      return;
    }

    void start();
  }, [standing, start]);

  const cancel = useCallback(() => {
    const made = recorder.current;

    recorder.current = null;
    made?.stop();
    setStanding("idle");
  }, []);

  return {
    standing,
    startedAt,
    levels,
    press,
    cancel,
  };
}
