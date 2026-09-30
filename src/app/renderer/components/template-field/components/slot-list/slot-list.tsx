import { WalkedRow } from "../../../walked-row";
import {
  TEMPLATE_FIELD_LIST_BACKGROUND_COLOR,
  TEMPLATE_FIELD_LIST_BORDER_COLOR,
  TEMPLATE_FIELD_LIST_BORDER_RADIUS_PX,
  TEMPLATE_FIELD_LIST_EMPTY_COLOR,
  TEMPLATE_FIELD_LIST_EMPTY_LABEL,
  TEMPLATE_FIELD_LIST_MAX_HEIGHT_PX,
  TEMPLATE_FIELD_LIST_SHADOW,
  TEMPLATE_FIELD_LIST_TOP_GAP_PX,
  TEMPLATE_FIELD_LIST_WIDTH_PX,
  TEMPLATE_FIELD_OPTION_GAP_PX,
  TEMPLATE_FIELD_OPTION_META_FONT_SIZE_PX,
  TEMPLATE_FIELD_OPTION_NAME_COLOR,
  TEMPLATE_FIELD_OPTION_NAME_FONT_SIZE_PX,
  TEMPLATE_FIELD_OPTION_PADDING,
  TEMPLATE_FIELD_OPTION_TYPE_BACKGROUND_COLOR,
  TEMPLATE_FIELD_OPTION_TYPE_BORDER_RADIUS_PX,
  TEMPLATE_FIELD_OPTION_TYPE_COLOR,
  TEMPLATE_FIELD_OPTION_TYPE_PADDING,
  TEMPLATE_FIELD_OPTION_USED_BACKGROUND_COLOR,
  TEMPLATE_FIELD_OPTION_USED_COLOR,
  TEMPLATE_FIELD_OPTION_USED_LABEL,
  TEMPLATE_FIELD_OPTION_USED_TYPE_BACKGROUND_COLOR,
  TEMPLATE_FIELD_OPTION_USED_TYPE_COLOR,
} from "../../constants";
import type { SlotListProps } from "./interfaces";

/** The names a «{» offers: the declared ones, narrowed by what was typed since the brace. */
export function SlotList({ offered, walk, onPick }: SlotListProps) {
  return (
    <div
      role="listbox"
      onMouseDown={(event) => event.preventDefault()}
      onClick={(event) => event.stopPropagation()}
      className="d-flex flex-column"
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        marginTop: TEMPLATE_FIELD_LIST_TOP_GAP_PX,
        width: TEMPLATE_FIELD_LIST_WIDTH_PX,
        maxHeight: TEMPLATE_FIELD_LIST_MAX_HEIGHT_PX,
        overflowY: "auto",
        zIndex: 2,
        borderRadius: TEMPLATE_FIELD_LIST_BORDER_RADIUS_PX,
        border: `1px solid ${TEMPLATE_FIELD_LIST_BORDER_COLOR}`,
        background: TEMPLATE_FIELD_LIST_BACKGROUND_COLOR,
        boxShadow: TEMPLATE_FIELD_LIST_SHADOW,
      }}
    >
      {offered.length === 0 ? (
        <span
          className="font-monospace"
          style={{
            padding: TEMPLATE_FIELD_OPTION_PADDING,
            color: TEMPLATE_FIELD_LIST_EMPTY_COLOR,
            fontSize: TEMPLATE_FIELD_OPTION_NAME_FONT_SIZE_PX,
          }}
        >
          {TEMPLATE_FIELD_LIST_EMPTY_LABEL}
        </span>
      ) : (
        offered.map((slot, index) => (
          <WalkedRow key={slot.name} walk={walk} index={index} borderRadius={TEMPLATE_FIELD_LIST_BORDER_RADIUS_PX}>
            <button
              type="button"
              role="option"
              aria-selected={slot.isUsed}
              onClick={() => onPick(slot.name)}
              className="d-flex align-items-center text-start"
              style={{
                padding: TEMPLATE_FIELD_OPTION_PADDING,
                gap: TEMPLATE_FIELD_OPTION_GAP_PX,
                border: "none",
                background: slot.isUsed ? TEMPLATE_FIELD_OPTION_USED_BACKGROUND_COLOR : "transparent",
                cursor: "pointer",
              }}
            >
              <span
                className="font-monospace"
                style={{
                  color: TEMPLATE_FIELD_OPTION_NAME_COLOR,
                  fontSize: TEMPLATE_FIELD_OPTION_NAME_FONT_SIZE_PX,
                }}
              >
                {slot.name}
              </span>
              <span
                className="font-monospace"
                style={{
                  padding: TEMPLATE_FIELD_OPTION_TYPE_PADDING,
                  borderRadius: TEMPLATE_FIELD_OPTION_TYPE_BORDER_RADIUS_PX,
                  background: slot.isUsed
                    ? TEMPLATE_FIELD_OPTION_USED_TYPE_BACKGROUND_COLOR
                    : TEMPLATE_FIELD_OPTION_TYPE_BACKGROUND_COLOR,
                  color: slot.isUsed ? TEMPLATE_FIELD_OPTION_USED_TYPE_COLOR : TEMPLATE_FIELD_OPTION_TYPE_COLOR,
                  fontSize: TEMPLATE_FIELD_OPTION_META_FONT_SIZE_PX,
                }}
              >
                {slot.type}
              </span>
              {slot.isUsed && (
                <span
                  className="font-monospace flex-fill text-end"
                  style={{
                    color: TEMPLATE_FIELD_OPTION_USED_COLOR,
                    fontSize: TEMPLATE_FIELD_OPTION_META_FONT_SIZE_PX,
                  }}
                >
                  {TEMPLATE_FIELD_OPTION_USED_LABEL}
                </span>
              )}
            </button>
          </WalkedRow>
        ))
      )}
    </div>
  );
}
