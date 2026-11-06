import { MIME_PARAMETERS_SEPARATOR, RECORDING_MIME_TYPE } from "../constants";

/** The recording's type without its codecs, as the provider reads it; the usual one where the recorder names none. */
export function recordingType(recorderType: string): string {
  const [type] = recorderType.split(MIME_PARAMETERS_SEPARATOR);

  return type.trim() === "" ? RECORDING_MIME_TYPE : type.trim();
}
