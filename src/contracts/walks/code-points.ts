/** The first and last of the halves a character outside the basic plane is written in. */
const HIGH_SURROGATE_FIRST = 0xd800;
const HIGH_SURROGATE_LAST = 0xdbff;
const LOW_SURROGATE_FIRST = 0xdc00;
const LOW_SURROGATE_LAST = 0xdfff;

/**
 * A text's length in code points, as the ceiling counts it: a surrogate pair counts once. Counted by a walk and not by
 * spreading the text, since a whole folder is counted this way and the spread would copy it.
 */
export function codePoints(text: string): number {
  let count = 0;

  for (let at = 0; at < text.length; at += 1) {
    const code = text.charCodeAt(at);
    const previous = at === 0 ? 0 : text.charCodeAt(at - 1);
    const isLowHalf = code >= LOW_SURROGATE_FIRST && code <= LOW_SURROGATE_LAST;
    const followsHighHalf = previous >= HIGH_SURROGATE_FIRST && previous <= HIGH_SURROGATE_LAST;

    if (!isLowHalf || !followsHighHalf) {
      count += 1;
    }
  }

  return count;
}
