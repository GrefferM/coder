import { LABEL_CUT_MARK } from "./constants";

/** A label cut to the room a head has for it: past that many letters it ends in an ellipsis. */
export function shortLabel(label: string, most: number): string {
  if (label.length <= most) {
    return label;
  }

  return `${label.slice(0, most - LABEL_CUT_MARK.length).trimEnd()}${LABEL_CUT_MARK}`;
}
