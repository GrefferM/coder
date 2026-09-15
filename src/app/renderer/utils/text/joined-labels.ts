import { LABELS_LAST_JOIN, LABELS_SEPARATOR } from "./constants";

/** Labels joined as a Ukrainian list: commas, «й» before the last. */
export function joinedLabels(labels: string[]): string {
  const last = labels.at(-1);

  if (last === undefined) {
    return "";
  }

  const named = labels.slice(0, -1).join(LABELS_SEPARATOR);

  return named ? `${named}${LABELS_LAST_JOIN}${last}` : last;
}
