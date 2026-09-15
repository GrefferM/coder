import { useInteraction } from "../../../../../../hooks";
import { useHint } from "../../../../../../components";
import { Mark } from "../../../../../../components";
import {
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_HOVER_TEXT_COLOR,
  INTERACTION_PRESSED_BACKGROUND_COLOR,
  INTERACTION_PRESSED_SHIFT_PX,
  INTERACTION_TRANSITION,
} from "../../../../../../constants";
import {
  SWITCHER_FORGET_COLOR,
  SWITCHER_FORGET_LABEL,
  SWITCHER_MISSING_COLOR,
  SWITCHER_AGENTS_SHORT_LABEL,
  SWITCHER_COUNT_LETTER_SPACING_PX,
  SWITCHER_MISSING_LABEL,
  SWITCHER_NAME_COLOR,
  SWITCHER_NAME_FONT_SIZE_PX,
  SWITCHER_ROW_BORDER_RADIUS_PX,
  SWITCHER_ROW_GAP_PX,
  SWITCHER_ROW_NAME_COLOR,
  SWITCHER_ROW_PADDING,
  SWITCHER_ROW_PATH_COLOR,
  SWITCHER_ROW_PATH_FONT_SIZE_PX,
} from "../../constants";
import type { ProjectRowProps } from "./interfaces";

/** One project row: name, folder, tick on the open one, cross to drop it; a gone folder is grey, unpickable. */
export function ProjectRow({
  name,
  directory,
  agentCount = null,
  isCurrent = false,
  exists = true,
  onSelect,
  onForget,
}: ProjectRowProps) {
  const row = useInteraction();
  const forget = useInteraction();
  // A wordless control says what it is in the app's own window, and never in the browser's `title`.
  const said = useHint<HTMLButtonElement>(SWITCHER_FORGET_LABEL, forget.isLit, forget.isFocused);
  const isPickable = !isCurrent && exists;
  const isRowLit = row.isLit && isPickable;
  const isRowHeld = row.isPressed && isPickable;
  const nameColor = exists ? (isCurrent ? SWITCHER_NAME_COLOR : SWITCHER_ROW_NAME_COLOR) : SWITCHER_MISSING_COLOR;

  return (
    <div
      className="d-flex align-items-center"
      style={{
        gap: SWITCHER_ROW_GAP_PX,
        borderRadius: SWITCHER_ROW_BORDER_RADIUS_PX,
        background: isRowHeld
          ? INTERACTION_PRESSED_BACKGROUND_COLOR
          : isCurrent || isRowLit
            ? INTERACTION_HOVER_BACKGROUND_COLOR
            : "transparent",
        transform: isRowHeld ? `translateY(${INTERACTION_PRESSED_SHIFT_PX}px)` : undefined,
        transition: INTERACTION_TRANSITION,
      }}
    >
      <button
        type="button"
        role="menuitem"
        aria-current={isCurrent}
        disabled={!isPickable}
        onClick={onSelect}
        {...row.handlers}
        className="d-flex align-items-center text-start flex-fill"
        style={{
          padding: SWITCHER_ROW_PADDING,
          gap: SWITCHER_ROW_GAP_PX,
          border: "none",
          background: "transparent",
          cursor: isPickable ? "pointer" : "default",
          minWidth: 0,
        }}
      >
        <span
          style={{
            width: 12,
            color: SWITCHER_NAME_COLOR,
            fontSize: SWITCHER_ROW_PATH_FONT_SIZE_PX,
          }}
        >
          {isCurrent ? "✓" : ""}
        </span>
        <span
          className="d-flex flex-column flex-fill"
          style={{
            gap: 2,
            minWidth: 0,
          }}
        >
          <span
            className="text-truncate"
            style={{
              fontSize: SWITCHER_NAME_FONT_SIZE_PX,
              color: nameColor,
            }}
          >
            {name}
          </span>
          <span
            className="font-monospace text-truncate"
            style={{
              fontSize: SWITCHER_ROW_PATH_FONT_SIZE_PX,
              color: exists ? SWITCHER_ROW_PATH_COLOR : SWITCHER_MISSING_COLOR,
            }}
          >
            {exists ? directory : SWITCHER_MISSING_LABEL}
          </span>
        </span>
        {exists && agentCount !== null && (
          <Mark
            color={SWITCHER_ROW_PATH_COLOR}
            spacing={SWITCHER_COUNT_LETTER_SPACING_PX}
            isUpperCase={false}
            className="flex-shrink-0"
          >{`${agentCount}${SWITCHER_AGENTS_SHORT_LABEL}`}</Mark>
        )}
      </button>
      {onForget && (
        <button
          type="button"
          ref={said.ref}
          aria-label={SWITCHER_FORGET_LABEL}
          onClick={onForget}
          {...forget.handlers}
          style={{
            padding: "0 10px 0 0",
            border: "none",
            background: "transparent",
            color: forget.isLit ? INTERACTION_HOVER_TEXT_COLOR : SWITCHER_FORGET_COLOR,
            fontSize: SWITCHER_NAME_FONT_SIZE_PX,
            cursor: "pointer",
            transform: forget.isPressed ? `translateY(${INTERACTION_PRESSED_SHIFT_PX}px)` : undefined,
            transition: INTERACTION_TRANSITION,
          }}
        >
          ✕{said.hint}
        </button>
      )}
    </div>
  );
}
