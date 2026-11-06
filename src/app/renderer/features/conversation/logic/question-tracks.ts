import type { WholeRun } from "../../record";
import type { HeardClip, SoundTrack } from "../../speech";

/**
 * The recordings each question was said with, by the question's id: those of the opened run read from the record, whose
 * sound is fetched by id, and those said on this screen, whose sound is still at hand and which win for their question.
 */
export function questionTracks(
  heardBy: Record<string, HeardClip[]>,
  run: WholeRun | null,
): Record<string, SoundTrack[]> {
  const tracks: Record<string, SoundTrack[]> = {};

  for (const question of run?.questions ?? []) {
    tracks[question.id] = question.recordings.map((recording) => ({
      id: recording.id,
      mimeType: recording.mimeType,
      durationMs: recording.durationMs,
      peaks: recording.peaks,
      audio: null,
    }));
  }

  return {
    ...tracks,
    ...heardBy,
  };
}
