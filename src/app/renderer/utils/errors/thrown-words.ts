import { errorMessage } from "./error-message";
import { providerWords } from "./provider-words";

/** What a thrown failure says, without the transport's wrapper. */
export function thrownWords(thrown: unknown): string {
  return providerWords(errorMessage(thrown));
}
