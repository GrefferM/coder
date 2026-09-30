import { STREAM_SEARCH_OF } from "../constants";

/** «3 З 8»: the match the stream stands on, of how many, counted from the freshest; nothing found is «0 З 0». */
export function foundOfLabel(at: number, found: number): string {
  return `${found === 0 ? 0 : at + 1}${STREAM_SEARCH_OF}${found}`;
}
