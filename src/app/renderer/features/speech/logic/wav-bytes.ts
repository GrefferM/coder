import {
  WAV_BITS_PER_SAMPLE,
  WAV_BYTES_PER_SAMPLE,
  WAV_CHANNELS,
  WAV_FORMAT_CHUNK_BYTES,
  WAV_HEADER_BYTES,
  WAV_PCM_FORMAT,
  WAV_SAMPLE_PEAK,
} from "./constants";
import type { WavSound } from "../interfaces";

/** One channel of samples from -1 to 1 as a 16-bit PCM WAV file, the kind macOS hears. */
export function wavBytes({ samples, sampleRate }: WavSound): Uint8Array {
  const dataBytes = samples.length * WAV_BYTES_PER_SAMPLE;
  const bytes = new Uint8Array(WAV_HEADER_BYTES + dataBytes);
  const view = new DataView(bytes.buffer);

  writeText(view, 0, "RIFF");
  view.setUint32(4, WAV_HEADER_BYTES - 8 + dataBytes, true);
  writeText(view, 8, "WAVE");
  writeText(view, 12, "fmt ");
  view.setUint32(16, WAV_FORMAT_CHUNK_BYTES, true);
  view.setUint16(20, WAV_PCM_FORMAT, true);
  view.setUint16(22, WAV_CHANNELS, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * WAV_CHANNELS * WAV_BYTES_PER_SAMPLE, true);
  view.setUint16(32, WAV_CHANNELS * WAV_BYTES_PER_SAMPLE, true);
  view.setUint16(34, WAV_BITS_PER_SAMPLE, true);
  writeText(view, 36, "data");
  view.setUint32(40, dataBytes, true);

  samples.forEach((sample, index) => {
    const clipped = Math.max(-1, Math.min(1, sample));

    view.setInt16(WAV_HEADER_BYTES + index * WAV_BYTES_PER_SAMPLE, Math.round(clipped * WAV_SAMPLE_PEAK), true);
  });

  return bytes;
}

function writeText(view: DataView, offset: number, text: string): void {
  [...text].forEach((letter, index) => {
    view.setUint8(offset + index, letter.charCodeAt(0));
  });
}
