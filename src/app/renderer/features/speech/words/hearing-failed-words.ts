import { HEARING_FAILED_MIDDLE } from "../constants";

/** «OpenAI не розпізнав: Incorrect API key provided» — the provider by name, then its own sentence. */
export function hearingFailedWords(providerName: string, said: string): string {
  return `${providerName}${HEARING_FAILED_MIDDLE}${said}`;
}
