import { FieldSlot, PickerShell } from "../../../../../../components";
import {
  PICKER_NAME_COLOR,
  PICKER_NAME_FONT_SIZE_PX,
  PICKER_PLACEHOLDER_COLOR,
  PICKER_ROW_BORDER_RADIUS_PX,
  PICKER_ROW_CHOSEN_BACKGROUND_COLOR,
  PICKER_ROW_GAP_PX,
  PICKER_ROW_PADDING,
  PICKER_VALUE_COLOR,
} from "../../../../../../components/picker-shell/constants";
import { NOT_FILLED_LABEL } from "../../../../../../constants";
import { localeLabel } from "../../../../words";
import { MAC_LOCALE_LABEL } from "../../../../constants";
import type { MacLocalePickerProps } from "./interfaces";

/** The one language macOS hears in (38d); macOS does not guess it, so it is chosen here and written at once. */
export function MacLocalePicker({ locales, locale, onChange }: MacLocalePickerProps) {
  return (
    <FieldSlot label={MAC_LOCALE_LABEL}>
      <PickerShell
        field={
          <span className="flex-fill text-truncate">{locale === null ? NOT_FILLED_LABEL : localeLabel(locale)}</span>
        }
        fieldColor={locale === null ? PICKER_PLACEHOLDER_COLOR : PICKER_VALUE_COLOR}
        items={locales}
        matches={(one, query) => localeLabel(one).toLowerCase().includes(query)}
        choose={(one, close) => {
          onChange(one);
          close();
        }}
        row={(one, close) => (
          <button
            key={one}
            type="button"
            role="option"
            aria-selected={one === locale}
            onClick={() => {
              onChange(one);
              close();
            }}
            className="d-flex align-items-center text-start"
            style={{
              padding: PICKER_ROW_PADDING,
              gap: PICKER_ROW_GAP_PX,
              borderRadius: PICKER_ROW_BORDER_RADIUS_PX,
              border: "none",
              background: one === locale ? PICKER_ROW_CHOSEN_BACKGROUND_COLOR : "transparent",
              color: PICKER_NAME_COLOR,
              fontSize: PICKER_NAME_FONT_SIZE_PX,
              cursor: "pointer",
            }}
          >
            {localeLabel(one)}
          </button>
        )}
      />
    </FieldSlot>
  );
}
