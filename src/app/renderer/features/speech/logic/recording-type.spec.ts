import { describe, expect, it } from "vitest";
import { recordingType } from "./recording-type";
import { RECORDING_MIME_TYPE } from "../constants";

describe("recordingType", () => {
  it("takes the codecs off the recorder's type", () => {
    expect(recordingType("audio/webm;codecs=opus")).toBe("audio/webm");
  });

  it("names the usual type where the recorder names none", () => {
    expect(recordingType("")).toBe(RECORDING_MIME_TYPE);
  });
});
