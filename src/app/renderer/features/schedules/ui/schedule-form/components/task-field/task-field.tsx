import { useId, useState } from "react";
import { FieldSlot } from "../../../../../../components";
import {
  FIELD_BACKGROUND_COLOR,
  FIELD_BORDER_COLOR,
  FIELD_BORDER_RADIUS_PX,
  FIELD_FOCUS_BORDER_COLOR,
  FIELD_INVALID_BORDER_COLOR,
  FIELD_INVALID_TRANSITION,
  FIELD_PADDING,
  FIELD_VALUE_COLOR,
} from "../../../../../../components/field/constants";
import { TASK_FIELD_FONT_SIZE_PX, TASK_FIELD_LINE_HEIGHT, TASK_FIELD_MIN_HEIGHT_PX } from "./constants";
import type { TaskFieldProps } from "./interfaces";

/** The task put to the agent at every tick: a field of prose that grows with what is written. */
export function TaskField({ label, value, placeholder, isInvalid, onChange }: TaskFieldProps) {
  const inputId = useId();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <FieldSlot label={label} htmlFor={inputId}>
      <textarea
        id={inputId}
        value={value}
        placeholder={placeholder}
        rows={2}
        spellCheck
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          minHeight: TASK_FIELD_MIN_HEIGHT_PX,
          padding: FIELD_PADDING,
          fontSize: TASK_FIELD_FONT_SIZE_PX,
          lineHeight: TASK_FIELD_LINE_HEIGHT,
          color: FIELD_VALUE_COLOR,
          background: FIELD_BACKGROUND_COLOR,
          border: `1px solid ${isInvalid ? FIELD_INVALID_BORDER_COLOR : isFocused ? FIELD_FOCUS_BORDER_COLOR : FIELD_BORDER_COLOR}`,
          borderRadius: FIELD_BORDER_RADIUS_PX,
          outline: "none",
          resize: "vertical",
          transition: FIELD_INVALID_TRANSITION,
        }}
      />
    </FieldSlot>
  );
}
