import { LABEL_CUT_MARK } from "./text.constant";

/** A label cut to `most` letters, ending in an ellipsis when longer. */
export function shortLabel(label: string, most: number): string {
  if (label.length <= most) {
    return label;
  }

  return `${label.slice(0, most - LABEL_CUT_MARK.length).trimEnd()}${LABEL_CUT_MARK}`;
}
