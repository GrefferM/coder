import { wavBytes } from "../logic";

/** A recording as the recorder made it, decoded and laid again as WAV for macOS; its first channel is what is heard. */
export async function wavRecording(audio: Uint8Array): Promise<Uint8Array> {
  const decoding = new AudioContext();

  try {
    const decoded = await decoding.decodeAudioData(audio.slice().buffer);

    return wavBytes({
      samples: decoded.getChannelData(0),
      sampleRate: decoded.sampleRate,
    });
  } finally {
    void decoding.close();
  }
}
