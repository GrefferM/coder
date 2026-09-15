import { useId, useState } from "react";
import { FieldSlot, QuietLine } from "../../../../../../../../components";
import {
  FIELD_BACKGROUND_COLOR,
  FIELD_BORDER_COLOR,
  FIELD_BORDER_RADIUS_PX,
  FIELD_FOCUS_BORDER_COLOR,
  FIELD_VALUE_COLOR,
} from "../../../../../../../../components/field/constants";
import {
  VALUES_FIELD_FONT_SIZE_PX,
  VALUES_FIELD_GAP_PX,
  VALUES_FIELD_LABEL,
  VALUES_FIELD_NOTE,
  VALUES_FIELD_PADDING,
  VALUES_FIELD_PLACEHOLDER,
} from "./constants";
import type { ValuesFieldProps } from "./interfaces";
import { ValueChip } from "./components";

/** Allowed `enum` values; shown for that type only. */
export function ValuesField({ values, onChange }: ValuesFieldProps) {
  const inputId = useId();
  const [typed, setTyped] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  /** A blank or already-added value is not added. */
  function add() {
    const value = typed.trim();

    if (value === "" || values.includes(value)) {
      setTyped("");

      return;
    }

    onChange([...values, value]);
    setTyped("");
  }

  return (
    <FieldSlot label={VALUES_FIELD_LABEL} htmlFor={inputId}>
      <div
        className="d-flex align-items-center flex-wrap"
        style={{
          padding: VALUES_FIELD_PADDING,
          gap: VALUES_FIELD_GAP_PX,
          borderRadius: FIELD_BORDER_RADIUS_PX,
          border: `1px solid ${isFocused ? FIELD_FOCUS_BORDER_COLOR : FIELD_BORDER_COLOR}`,
          background: FIELD_BACKGROUND_COLOR,
        }}
      >
        {values.map((value) => (
          <ValueChip key={value} value={value} onRemove={() => onChange(values.filter((held) => held !== value))} />
        ))}
        <input
          spellCheck={false}
          id={inputId}
          value={typed}
          placeholder={values.length === 0 ? VALUES_FIELD_PLACEHOLDER : undefined}
          onChange={(event) => setTyped(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            add();
          }}
          className="font-monospace flex-fill"
          style={{
            border: "none",
            background: "transparent",
            color: FIELD_VALUE_COLOR,
            fontSize: VALUES_FIELD_FONT_SIZE_PX,
            outline: "none",
            minWidth: 0,
          }}
        />
      </div>
      <QuietLine>{VALUES_FIELD_NOTE}</QuietLine>
    </FieldSlot>
  );
}
