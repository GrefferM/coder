import {
  SETTINGS_ROW_BORDER_RADIUS_PX,
  SETTINGS_ROW_NAME_COLOR,
  SETTINGS_ROW_NAME_FONT_SIZE_PX,
  SETTINGS_ROW_PADDING,
} from "../../constants";
import {
  GRANTED_ROW_DIMMED_OPACITY,
  GRANTED_ROW_GAP_PX,
  GRANTED_ROW_NOTE_COLOR,
  GRANTED_ROW_NOTE_FONT_SIZE_PX,
} from "./constants";
import { INTERACTION_REST_BACKGROUND_COLOR, INTERACTION_REST_BORDER_COLOR } from "../../../../../../../../constants";
import type { GrantedRowProps } from "./interfaces";

/** A grant that opens nothing, by its name; a note under it dims the row and says why the grant does not act. */
export function GrantedRow({ name, note }: GrantedRowProps) {
  return (
    <div
      className="d-flex flex-column"
      style={{
        padding: SETTINGS_ROW_PADDING,
        gap: GRANTED_ROW_GAP_PX,
        borderRadius: SETTINGS_ROW_BORDER_RADIUS_PX,
        border: `1px solid ${INTERACTION_REST_BORDER_COLOR}`,
        background: INTERACTION_REST_BACKGROUND_COLOR,
        opacity: note === null ? 1 : GRANTED_ROW_DIMMED_OPACITY,
      }}
    >
      <span
        className="font-monospace flex-fill text-truncate"
        style={{
          color: SETTINGS_ROW_NAME_COLOR,
          fontSize: SETTINGS_ROW_NAME_FONT_SIZE_PX,
        }}
      >
        {name}
      </span>
      {note !== null && (
        <span
          style={{
            color: GRANTED_ROW_NOTE_COLOR,
            fontSize: GRANTED_ROW_NOTE_FONT_SIZE_PX,
          }}
        >
          {note}
        </span>
      )}
    </div>
  );
}
