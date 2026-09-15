import { useId, useState } from "react";
import { FieldSlot, QuietLine } from "../field-slot";
import { FIELD_SLOT_CHANGED_BORDER_COLOR } from "../field-slot/constants";
import {
  FIELD_BACKGROUND_COLOR,
  FIELD_SUNKEN_BACKGROUND_COLOR,
  FIELD_MINUS,
  FIELD_NUMBER_LEAST,
  FIELD_BORDER_COLOR,
  FIELD_BORDER_RADIUS_PX,
  FIELD_FOCUS_BORDER_COLOR,
  FIELD_INVALID_BORDER_COLOR,
  FIELD_INVALID_TRANSITION,
  FIELD_WARNED_BORDER_COLOR,
  FIELD_WARNED_CLASS,
  FIELD_PADDING,
  FIELD_UNIT_GAP_PX,
  FIELD_UNIT_LETTER_SPACING_PX,
  FIELD_VALUE_COLOR,
  FIELD_VALUE_FONT_SIZE_PX,
} from "./constants";
import { Mark } from "../mark";
import type { FieldProps } from "./interfaces";
import { Clear } from "./components";

/** Labelled input: focus and invalid show on the box border, the draft marks come from `FieldSlot`. */
export function Field({
  label,
  ref,
  value,
  onChange,
  type = "text",
  step,
  placeholder,
  note,
  unit,
  isMono = false,
  isProse = false,
  isInvalid = false,
  isWarned = false,
  wasValue = null,
  action,
  isSunken = false,
  onClear,
}: FieldProps) {
  const inputId = useId();
  const [isFocused, setIsFocused] = useState(false);
  const restingBorderColor = wasValue === null ? FIELD_BORDER_COLOR : FIELD_SLOT_CHANGED_BORDER_COLOR;
  const isNumber = type === "number";

  return (
    <FieldSlot label={label} htmlFor={inputId} wasValue={wasValue} action={action}>
      <div
        className="d-flex align-items-center"
        style={{
          gap: FIELD_UNIT_GAP_PX,
          padding: FIELD_PADDING,
          backgroundColor: isSunken ? FIELD_SUNKEN_BACKGROUND_COLOR : FIELD_BACKGROUND_COLOR,
          /**
           * A refusal outranks a warning and both outrank the focus border, so neither mark is hidden by the
           * caret standing in the field: what the app is saying about the value does not depend on where the
           * hand is.
           */
          border: `1px solid ${isInvalid ? FIELD_INVALID_BORDER_COLOR : isWarned ? FIELD_WARNED_BORDER_COLOR : isFocused ? FIELD_FOCUS_BORDER_COLOR : restingBorderColor}`,
          borderRadius: FIELD_BORDER_RADIUS_PX,
          transition: FIELD_INVALID_TRANSITION,
        }}
      >
        <input
          ref={ref}
          id={inputId}
          type={type}
          step={step}
          min={isNumber ? FIELD_NUMBER_LEAST : undefined}
          value={value}
          placeholder={placeholder}
          // A number field takes nothing below zero: the minus never goes in, by hand or by the arrows.
          onKeyDown={(event) => {
            if (isNumber && event.key === FIELD_MINUS) {
              event.preventDefault();
            }
          }}
          onChange={(event) => {
            if (!isNumber || !event.target.value.includes(FIELD_MINUS)) {
              onChange(event.target.value);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          spellCheck={isProse}
          className={`flex-fill${isMono ? " font-monospace" : ""}${isWarned ? ` ${FIELD_WARNED_CLASS}` : ""}`}
          style={{
            minWidth: 0,
            padding: 0,
            fontSize: FIELD_VALUE_FONT_SIZE_PX,
            color: FIELD_VALUE_COLOR,
            background: "transparent",
            border: "none",
            outline: "none",
          }}
        />
        {unit !== undefined && <Mark spacing={FIELD_UNIT_LETTER_SPACING_PX}>{unit}</Mark>}
        {onClear !== undefined && <Clear onClear={onClear} />}
      </div>
      {/* The line that taught the rule is the line that says it was broken; only its colour moves. */}
      {note !== undefined && <QuietLine isTroubled={isInvalid}>{note}</QuietLine>}
    </FieldSlot>
  );
}
