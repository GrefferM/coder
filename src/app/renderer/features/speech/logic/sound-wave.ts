import { LOUD_LEVEL, SAMPLE_MIDDLE } from "./constants";

/** How loud one moment of the microphone is, from 0 for silence to 1 for a voice close by. */
export function soundLevel(samples: Uint8Array): number {
  if (samples.length === 0) {
    return 0;
  }

  let power = 0;

  for (const sample of samples) {
    const swing = (sample - SAMPLE_MIDDLE) / SAMPLE_MIDDLE;

    power += swing * swing;
  }

  return Math.min(1, Math.sqrt(power / samples.length) / LOUD_LEVEL);
}

/** A whole recording's levels drawn as this many bars: each bar is the loudest moment of its share. */
export function wavePeaks(levels: number[], count: number): number[] {
  if (levels.length <= count) {
    return levels;
  }

  return Array.from(
    {
      length: count,
    },
    (_, bar) => {
      const from = Math.floor((bar * levels.length) / count);
      const to = Math.floor(((bar + 1) * levels.length) / count);

      return Math.max(...levels.slice(from, to));
    },
  );
}

/** How many bars of a wave stand played, at this share of the recording. */
export function playedBars(bars: number, share: number): number {
  return Math.round(bars * Math.min(1, Math.max(0, share)));
}
