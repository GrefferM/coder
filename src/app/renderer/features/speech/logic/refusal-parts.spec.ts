import { describe, expect, it } from "vitest";
import { refusalParts } from "./refusal-parts";
import { REFUSAL_SAID_SEPARATOR, SPEECH_HEARING_FAILED, SPEECH_NOT_SET } from "../../../../../contracts";

describe("refusalParts", () => {
  it("parts a refusal into its code and the sentence beside it", () => {
    expect(refusalParts(`${SPEECH_HEARING_FAILED}${REFUSAL_SAID_SEPARATOR}Incorrect API key provided`)).toEqual({
      code: SPEECH_HEARING_FAILED,
      said: "Incorrect API key provided",
    });
  });

  it("reads a refusal that said nothing as its code alone", () => {
    expect(refusalParts(SPEECH_NOT_SET)).toEqual({
      code: SPEECH_NOT_SET,
      said: "",
    });
  });
});
