import { STREAM_SEARCH_OF } from "../constants";

/**
 * «3 З 8» — which match the stream stands on, of how many it holds, counted from the freshest. Nothing found
 * says «0 З 0» rather than nothing at all.
 */
export function foundOfLabel(at: number, found: number): string {
  return `${found === 0 ? 0 : at + 1}${STREAM_SEARCH_OF}${found}`;
}
