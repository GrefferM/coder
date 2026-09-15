import { DraftDot, WasLine } from "../field-slot";
import { Mark } from "../mark";
import { FIELD_LABEL_GAP_PX } from "../field/constants";
import { FIELD_SLOT_CHANGED_BORDER_COLOR, FIELD_SLOT_DOT_GAP_PX } from "../field-slot/constants";
import {
  SETTING_ROW_BACKGROUND_COLOR,
  SETTING_ROW_BORDER_COLOR,
  SETTING_ROW_BORDER_RADIUS_PX,
  SETTING_ROW_HINT_COLOR,
  SETTING_ROW_HINT_LINE_HEIGHT,
  SETTING_ROW_LABEL_COLOR,
  SETTING_ROW_LABEL_FONT_SIZE_PX,
  SETTING_ROW_PADDING,
} from "./constants";
import type { SettingRowProps } from "./interfaces";

/** Labelled setting row with the three draft marks: dot, border step, «БУЛО · …». */
export function SettingRow({ label, children, wasValue = null, hint }: SettingRowProps) {
  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: FIELD_LABEL_GAP_PX,
      }}
    >
      <div
        className="d-flex align-items-center justify-content-between"
        style={{
          padding: SETTING_ROW_PADDING,
          borderRadius: SETTING_ROW_BORDER_RADIUS_PX,
          border: `1px solid ${wasValue === null ? SETTING_ROW_BORDER_COLOR : FIELD_SLOT_CHANGED_BORDER_COLOR}`,
          background: SETTING_ROW_BACKGROUND_COLOR,
        }}
      >
        <span
          className="d-flex align-items-center"
          style={{
            gap: FIELD_SLOT_DOT_GAP_PX,
            color: SETTING_ROW_LABEL_COLOR,
            fontSize: SETTING_ROW_LABEL_FONT_SIZE_PX,
          }}
        >
          {label}
          {wasValue !== null && <DraftDot />}
        </span>
        {children}
      </div>
      {hint !== undefined && (
        <Mark color={SETTING_ROW_HINT_COLOR} lineHeight={SETTING_ROW_HINT_LINE_HEIGHT} isUpperCase={false}>
          {hint}
        </Mark>
      )}
      {wasValue !== null && <WasLine value={wasValue} />}
    </div>
  );
}
