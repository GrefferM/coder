import { describe, expect, it } from "vitest";
import { wavBytes } from "./wav-bytes";

function textAt(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(...bytes.slice(offset, offset + 4));
}

describe("wavBytes", () => {
  it("heads the samples as one channel of 16-bit PCM at their own rate", () => {
    const bytes = wavBytes({
      samples: new Float32Array([0, 0.5]),
      sampleRate: 48000,
    });
    const view = new DataView(bytes.buffer);

    expect(textAt(bytes, 0)).toBe("RIFF");
    expect(textAt(bytes, 8)).toBe("WAVE");
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(48000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(4);
    expect(bytes.length).toBe(48);
  });

  it("writes each sample at its loudness, and one past the edge at the edge", () => {
    const bytes = wavBytes({
      samples: new Float32Array([1, -2]),
      sampleRate: 16000,
    });
    const view = new DataView(bytes.buffer);

    expect(view.getInt16(44, true)).toBe(32767);
    expect(view.getInt16(46, true)).toBe(-32767);
  });
});
