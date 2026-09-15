import { useId, useRef, useState } from "react";
import { FieldSlot, QuietLine } from "../field-slot";
import { FIELD_SLOT_CHANGED_BORDER_COLOR } from "../field-slot/constants";
import {
  FIELD_BORDER_COLOR,
  FIELD_BORDER_RADIUS_PX,
  FIELD_FOCUS_BORDER_COLOR,
  FIELD_INVALID_BORDER_COLOR,
  FIELD_INVALID_TRANSITION,
  FIELD_VALUE_COLOR,
} from "../field/constants";
import { openBrace } from "../../utils/text";
import { useListWalk, useWindowDismiss } from "../../hooks";
import {
  TEMPLATE_FIELD_BACKGROUND_COLOR,
  TEMPLATE_FIELD_FONT_SIZE_PX,
  TEMPLATE_FIELD_LINE_HEIGHT,
  TEMPLATE_FIELD_PADDING,
  TEMPLATE_FIELD_SLOT_CLOSE,
} from "./constants";
import { SlotBackdrop, SlotList } from "./components";
import type { OpenBrace } from "../../utils/text";
import type { TemplateFieldProps } from "./interfaces";

/** A `{name}` matching a declared parameter is a slot; a backdrop under transparent glyphs colours it. */
export function TemplateField({
  label,
  value,
  onChange,
  placeholder,
  note,
  isInvalid = false,
  wasValue = null,
  slots,
}: TemplateFieldProps) {
  const inputId = useId();
  const backdropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [brace, setBrace] = useState<OpenBrace | null>(null);
  // A brace hushed by Escape stays hushed until the line is typed into again.
  const [hushedAt, setHushedAt] = useState<number | null>(null);
  const restingBorderColor = wasValue === null ? FIELD_BORDER_COLOR : FIELD_SLOT_CHANGED_BORDER_COLOR;
  const textStyle = {
    padding: TEMPLATE_FIELD_PADDING,
    fontSize: TEMPLATE_FIELD_FONT_SIZE_PX,
    lineHeight: TEMPLATE_FIELD_LINE_HEIGHT,
  };
  const declared = slots ?? [];
  const offered =
    brace === null ? [] : declared.filter((slot) => slot.name.toLowerCase().startsWith(brace.typed.toLowerCase()));
  const isListOpen = brace !== null && slots !== undefined && brace.at !== hushedAt;

  useWindowDismiss(isListOpen, () => setBrace(null));
  // The letters stay in the line while the arrows walk the offered names, and Enter takes the one they stand on.
  const walk = useListWalk(offered.length, isListOpen, (index) => pick(offered[index].name));

  /** A slot is a brace whose name is declared; with no declared list, every name in braces. */
  function isSlot(part: { text: string; isSlot: boolean }): boolean {
    return part.isSlot && (slots === undefined || declared.some((slot) => slot.name === part.text.slice(1, -1)));
  }

  /** Updates `brace` from the caret position. */
  function readCaret(input: HTMLInputElement) {
    setBrace(openBrace(input.value, input.selectionStart ?? input.value.length));
  }

  /** Writes the chosen name into the open brace, closes it, and restores the caret after it. */
  function pick(name: string) {
    if (brace === null) {
      return;
    }

    const caret = brace.at + 1 + brace.typed.length;
    const written = `${value.slice(0, brace.at + 1)}${name}${TEMPLATE_FIELD_SLOT_CLOSE}${value.slice(caret)}`;
    const after = brace.at + 1 + name.length + TEMPLATE_FIELD_SLOT_CLOSE.length;

    setBrace(null);
    onChange(written);
    window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(after, after);
    });
  }

  return (
    <FieldSlot label={label} htmlFor={inputId} wasValue={wasValue}>
      <div
        style={{
          position: "relative",
        }}
      >
        <div
          style={{
            position: "relative",
            borderRadius: FIELD_BORDER_RADIUS_PX,
            border: `1px solid ${isFocused ? FIELD_FOCUS_BORDER_COLOR : isInvalid ? FIELD_INVALID_BORDER_COLOR : restingBorderColor}`,
            background: TEMPLATE_FIELD_BACKGROUND_COLOR,
            transition: FIELD_INVALID_TRANSITION,
            overflow: "hidden",
          }}
        >
          <div
            ref={backdropRef}
            aria-hidden
            className="font-monospace text-nowrap"
            style={{
              ...textStyle,
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              pointerEvents: "none",
              color: FIELD_VALUE_COLOR,
            }}
          >
            <SlotBackdrop value={value} isSlot={isSlot} />
          </div>
          <input
            id={inputId}
            ref={inputRef}
            value={value}
            placeholder={placeholder}
            onChange={(event) => {
              setHushedAt(null);
              onChange(event.target.value);
              readCaret(event.currentTarget);
            }}
            onKeyDown={(event) => {
              if (!isListOpen) {
                return;
              }

              // An open list answers Escape itself; the panel underneath must not react.
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                setHushedAt(brace?.at ?? null);

                return;
              }

              walk.onKeyDown(event);
            }}
            onKeyUp={(event) => readCaret(event.currentTarget)}
            onClick={(event) => {
              setHushedAt(null);
              readCaret(event.currentTarget);
            }}
            onScroll={(event) => {
              if (backdropRef.current !== null) {
                backdropRef.current.scrollLeft = event.currentTarget.scrollLeft;
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            spellCheck={false}
            className="font-monospace w-100"
            style={{
              ...textStyle,
              position: "relative",
              border: "none",
              background: "transparent",
              // The glyphs belong to the backdrop; the caret and the selection stay here.
              color: "transparent",
              caretColor: FIELD_VALUE_COLOR,
              outline: "none",
            }}
          />
        </div>

        {isListOpen && <SlotList offered={offered} walk={walk} onPick={pick} />}
      </div>

      {note !== undefined && <QuietLine>{note}</QuietLine>}
    </FieldSlot>
  );
}
