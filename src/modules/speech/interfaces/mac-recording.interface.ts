/** One recording for macOS to hear: WAV bytes and the language they are said in. */
export interface MacRecording {
  audio: Uint8Array;
  locale: string;
}
