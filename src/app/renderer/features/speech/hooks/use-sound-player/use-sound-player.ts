import { useCallback, useEffect, useRef, useState } from "react";
import { recordingSound } from "../../api";
import type { SoundPlayer, SoundPlayerHands, SoundTrack } from "../../interfaces";

/**
 * One recording for the whole window (4l): a new one stops the old, the one playing can be held and gone on with, and
 * nothing is left playing when the window goes.
 */
export function useSoundPlayer(hands: SoundPlayerHands): SoundPlayer {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playedMs, setPlayedMs] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  /** Held in a ref, so a play begun under old hands silences the reading through the current ones. */
  const held = useRef(hands);
  /** The sound playing, with the address its bytes stand at. */
  const playing = useRef<HTMLAudioElement | null>(null);
  const address = useRef<string | null>(null);
  /** Counts the plays asked for; one whose sound arrives after a later ask plays nothing. */
  const asked = useRef(0);

  held.current = hands;

  const stop = useCallback(() => {
    asked.current += 1;
    playing.current?.pause();
    playing.current = null;

    if (address.current !== null) {
      URL.revokeObjectURL(address.current);
      address.current = null;
    }

    setPlayingId(null);
    setPlayedMs(0);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    return stop;
  }, [stop]);

  // The played part follows the sound frame by frame while it plays.
  useEffect(() => {
    if (playingId === null) {
      return;
    }

    let frame = requestAnimationFrame(follow);

    function follow() {
      setPlayedMs((playing.current?.currentTime ?? 0) * 1_000);
      frame = requestAnimationFrame(follow);
    }

    return () => cancelAnimationFrame(frame);
  }, [playingId]);

  const play = useCallback(
    async (track: SoundTrack, fromMs: number) => {
      stop();
      held.current.onPlay();

      const ask = asked.current;
      const audio = track.audio ?? (await recordingSound(track.id));

      // A sound the record no longer holds, or one overtaken by a later press, is not played.
      if (audio === null || ask !== asked.current) {
        return;
      }

      const sound = new Blob([new Uint8Array(audio)], {
        type: track.mimeType,
      });
      const made = new Audio(URL.createObjectURL(sound));

      address.current = made.src;
      made.currentTime = fromMs / 1_000;
      made.onended = stop;
      playing.current = made;
      setPlayingId(track.id);
      setPlayedMs(fromMs);
      await made.play();
    },
    [stop],
  );

  /** Goes on with the track held, silencing the reading as a play begun does. */
  const resume = useCallback(() => {
    held.current.onPlay();
    setIsPaused(false);
    void playing.current?.play();
  }, []);

  const toggle = useCallback(
    (track: SoundTrack) => {
      if (playingId !== track.id || playing.current === null) {
        void play(track, 0);

        return;
      }

      if (isPaused) {
        resume();

        return;
      }

      playing.current.pause();
      setIsPaused(true);
    },
    [playingId, isPaused, play, resume],
  );

  const seek = useCallback(
    (track: SoundTrack, share: number) => {
      const atMs = share * track.durationMs;
      const made = playing.current;

      if (playingId !== track.id || made === null) {
        void play(track, atMs);

        return;
      }

      made.currentTime = atMs / 1_000;
      setPlayedMs(atMs);

      if (isPaused) {
        resume();
      }
    },
    [playingId, isPaused, play, resume],
  );

  return {
    playingId,
    playedMs,
    isPaused,
    toggle,
    seek,
    stop,
  };
}
