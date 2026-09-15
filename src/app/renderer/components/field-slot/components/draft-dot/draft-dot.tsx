import { FIELD_SLOT_DOT_COLOR, FIELD_SLOT_DOT_SIZE_PX } from "../../constants";

/** Accent dot beside the label of a draft-changed field. */
export function DraftDot() {
  return (
    <span
      className="flex-shrink-0"
      style={{
        width: FIELD_SLOT_DOT_SIZE_PX,
        height: FIELD_SLOT_DOT_SIZE_PX,
        borderRadius: "50%",
        background: FIELD_SLOT_DOT_COLOR,
      }}
    />
  );
}
