import { usePressable } from "../../../../../../hooks";
import { DraftDot, Mark } from "../../../../../../components";
import {
  PROMPT_EDITOR_META_COLOR,
  PROMPT_EDITOR_NAME_COLOR,
  PROMPT_EDITOR_NAME_FONT_SIZE_PX,
  PROMPT_EDITOR_NAME_GAP_PX,
  PROMPT_EDITOR_NAME_LABEL,
  PROMPT_EDITOR_NAME_PLACEHOLDER,
  PROMPT_EDITOR_NAME_WEIGHT,
  PROMPT_EDITOR_NAME_WIDTH_PX,
} from "../../constants";
import type { EditorNameProps } from "./interfaces";

/** The prompt's name — a word until it is pressed, a field while it is being written. */
export function EditorName({ name, wasName, isRenaming, onRenaming, onRename }: EditorNameProps) {
  const press = usePressable(() => onRenaming(true));
  /**
   * What the word and the field must share to be the same slot. Written once: two copies of a width that must
   * agree are two copies that will one day disagree, and the disagreement shows as everything beside the name
   * jumping sideways at the press.
   */
  const slot = {
    width: PROMPT_EDITOR_NAME_WIDTH_PX,
    fontSize: PROMPT_EDITOR_NAME_FONT_SIZE_PX,
    fontWeight: PROMPT_EDITOR_NAME_WEIGHT,
  };

  return (
    <div
      className="d-flex align-items-center flex-shrink-0"
      {...(isRenaming ? {} : press.handlers)}
      style={{
        gap: PROMPT_EDITOR_NAME_GAP_PX,
        cursor: "text",
      }}
    >
      {isRenaming ? (
        <input
          spellCheck={false}
          aria-label={PROMPT_EDITOR_NAME_LABEL}
          autoFocus
          value={name}
          placeholder={PROMPT_EDITOR_NAME_PLACEHOLDER}
          onChange={(event) => onRename(event.target.value)}
          onBlur={() => onRenaming(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onRenaming(false);
            }
          }}
          style={{
            ...slot,
            border: "none",
            background: "transparent",
            padding: 0,
            outline: "none",
            color: PROMPT_EDITOR_NAME_COLOR,
          }}
        />
      ) : (
        <span
          className="text-truncate"
          style={{
            ...slot,
            color: name ? PROMPT_EDITOR_NAME_COLOR : PROMPT_EDITOR_META_COLOR,
          }}
        >
          {name || PROMPT_EDITOR_NAME_PLACEHOLDER}
        </span>
      )}
      <Mark className="text-nowrap">{PROMPT_EDITOR_NAME_LABEL}</Mark>
      {/* The name is a field like any other. */}
      {wasName !== null && <DraftDot />}
    </div>
  );
}
