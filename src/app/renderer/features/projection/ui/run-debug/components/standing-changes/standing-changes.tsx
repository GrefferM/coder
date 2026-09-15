import {
  STANDING_CHANGES_BACKGROUND_COLOR,
  STANDING_CHANGES_BORDER_COLOR,
  STANDING_CHANGES_BORDER_RADIUS_PX,
  STANDING_CHANGES_GAP_PX,
  STANDING_CHANGES_LABEL,
  STANDING_CHANGES_LABEL_COLOR,
  STANDING_CHANGES_LABEL_FONT_SIZE_PX,
  STANDING_CHANGES_LABEL_LETTER_SPACING_PX,
  STANDING_CHANGES_PADDING,
  STANDING_CHANGES_ROW_GAP_PX,
} from "../../../../constants";
import type { StandingChangesProps } from "./interfaces";
import { ChangeCard } from "./components";

/**
 * Under the graph, what has moved since this run walked — one card per agent, «тоді» against «зараз».
 * Nothing stands here where nothing has moved, which is most runs; the card is a comparison, and a
 * comparison of a thing with itself says nothing.
 */
export function StandingChanges({ changes }: StandingChangesProps) {
  if (changes.length === 0) {
    return null;
  }

  return (
    <div
      className="d-flex flex-column flex-shrink-0"
      style={{
        gap: STANDING_CHANGES_GAP_PX,
        padding: STANDING_CHANGES_PADDING,
        borderRadius: STANDING_CHANGES_BORDER_RADIUS_PX,
        background: STANDING_CHANGES_BACKGROUND_COLOR,
        border: `1px solid ${STANDING_CHANGES_BORDER_COLOR}`,
      }}
    >
      <span
        className="font-monospace"
        style={{
          color: STANDING_CHANGES_LABEL_COLOR,
          fontSize: STANDING_CHANGES_LABEL_FONT_SIZE_PX,
          letterSpacing: STANDING_CHANGES_LABEL_LETTER_SPACING_PX,
        }}
      >
        {STANDING_CHANGES_LABEL}
      </span>
      <div
        className="d-flex"
        style={{
          gap: STANDING_CHANGES_ROW_GAP_PX,
        }}
      >
        {changes.map((change) => (
          <ChangeCard key={change.id} change={change} />
        ))}
      </div>
    </div>
  );
}
