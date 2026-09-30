import { DraftDot, WasLine } from "./components";
import { FIELD_LABEL_COLOR, FIELD_LABEL_FONT_SIZE_PX, FIELD_LABEL_GAP_PX } from "../field/constants";
import { FIELD_SLOT_DOT_GAP_PX } from "./constants";
import type { ReactNode } from "react";
import type { FieldSlotProps } from "./interfaces";

/** Label and content; while draft-changed, an accent dot beside the label and «БУЛО · …» under the box. */
export function FieldSlot({ label, children, htmlFor, wasValue = null, action }: FieldSlotProps) {
  const labelStyle = {
    color: FIELD_LABEL_COLOR,
    fontSize: FIELD_LABEL_FONT_SIZE_PX,
    gap: FIELD_SLOT_DOT_GAP_PX,
  };
  const labelContent: ReactNode = (
    <>
      {label}
      {wasValue !== null && <DraftDot />}
    </>
  );

  return (
    <div
      /** Marks the slot as a field: Tab walks the slots of the open tab, one stop each, however much stands inside. */
      data-field
      className="d-flex flex-column"
      style={{
        gap: FIELD_LABEL_GAP_PX,
      }}
    >
      <div className="d-flex align-items-center justify-content-between">
        {htmlFor === undefined ? (
          <span className="d-flex align-items-center text-uppercase font-monospace" style={labelStyle}>
            {labelContent}
          </span>
        ) : (
          <label
            htmlFor={htmlFor}
            className="d-flex align-items-center text-uppercase font-monospace"
            style={labelStyle}
          >
            {labelContent}
          </label>
        )}
        {action}
      </div>
      {children}
      {wasValue !== null && <WasLine value={wasValue} />}
    </div>
  );
}
