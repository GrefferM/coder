/** One channel of a recording as samples from -1 to 1, and how many of them make a second. */
export interface WavSound {
  samples: Float32Array;
  sampleRate: number;
}
