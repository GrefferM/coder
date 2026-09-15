import { BackChevron, IconButton, Mark, UnsavedMark } from "../../../../../../components";
import {
  STEP_HEAD_BACKGROUND_COLOR,
  STEP_HEAD_BORDER_COLOR,
  STEP_HEAD_COLOR,
  STEP_HEAD_FONT_SIZE_PX,
  STEP_HEAD_GAP_PX,
  STEP_HEAD_LETTER_SPACING_PX,
  STEP_HEAD_PADDING,
} from "../../../../../../components/step-head/constants";
import { ukrainianPlural } from "../../../../../../utils/text";
import {
  PROMPT_EDITOR_COLLAPSE_BORDER_COLOR,
  PROMPT_EDITOR_COLLAPSE_BORDER_RADIUS_PX,
  PROMPT_EDITOR_COLLAPSE_GAP_PX,
  PROMPT_EDITOR_COLLAPSE_ICON_SIZE_PX,
  PROMPT_EDITOR_COLLAPSE_LABEL,
  PROMPT_EDITOR_COLLAPSE_PADDING,
  PROMPT_EDITOR_MONO_FONT_SIZE_PX,
  PROMPT_EDITOR_MONO_LETTER_SPACING_PX,
  PROMPT_EDITOR_NAME_PLACEHOLDER,
  PROMPT_EDITOR_SECTION_LABEL,
  PROMPT_EDITOR_SEPARATOR,
  PROMPT_EDITOR_WORD_FORMS,
} from "../../constants";
import type { EditorHeadProps } from "./interfaces";

/**
 * The prompt's own head: the way back, whose prompt it is, how many words stand in it and the way to fold the
 * editor away. It wears the shape of every head of a step walked into — `StepHead`'s — and is not that component,
 * because the whole of that head is one button, and this row has two of its own to press.
 */
export function EditorHead({ name, words, hasUnsaved, onClose }: EditorHeadProps) {
  const [wordOne, wordFew, wordMany] = PROMPT_EDITOR_WORD_FORMS;

  return (
    <div
      className="d-flex align-items-center flex-shrink-0"
      style={{
        gap: STEP_HEAD_GAP_PX,
        padding: STEP_HEAD_PADDING,
        borderBottom: `1px solid ${STEP_HEAD_BORDER_COLOR}`,
        background: STEP_HEAD_BACKGROUND_COLOR,
      }}
    >
      <IconButton
        label={PROMPT_EDITOR_SECTION_LABEL}
        onPress={onClose}
        tone={{
          rest: STEP_HEAD_COLOR,
          lit: STEP_HEAD_COLOR,
        }}
      >
        <BackChevron />
      </IconButton>
      <Mark
        color={STEP_HEAD_COLOR}
        size={STEP_HEAD_FONT_SIZE_PX}
        spacing={STEP_HEAD_LETTER_SPACING_PX}
        className="text-truncate"
      >
        {`${PROMPT_EDITOR_SECTION_LABEL}${PROMPT_EDITOR_SEPARATOR}${name || PROMPT_EDITOR_NAME_PLACEHOLDER}`}
      </Mark>
      {hasUnsaved && <UnsavedMark />}
      <span className="flex-fill" />
      <Mark className="text-nowrap">{`${words} ${ukrainianPlural(words, wordOne, wordFew, wordMany)}`}</Mark>
      <button
        type="button"
        onClick={onClose}
        className="d-flex align-items-center font-monospace text-uppercase text-nowrap"
        style={{
          gap: PROMPT_EDITOR_COLLAPSE_GAP_PX,
          padding: PROMPT_EDITOR_COLLAPSE_PADDING,
          borderRadius: PROMPT_EDITOR_COLLAPSE_BORDER_RADIUS_PX,
          border: `1px solid ${PROMPT_EDITOR_COLLAPSE_BORDER_COLOR}`,
          background: "transparent",
          color: STEP_HEAD_COLOR,
          fontSize: PROMPT_EDITOR_MONO_FONT_SIZE_PX,
          letterSpacing: PROMPT_EDITOR_MONO_LETTER_SPACING_PX,
          cursor: "pointer",
        }}
      >
        <svg
          width={PROMPT_EDITOR_COLLAPSE_ICON_SIZE_PX}
          height={PROMPT_EDITOR_COLLAPSE_ICON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 15 4 20M4 15h5v5M15 9l5-5M20 9h-5V4" />
        </svg>
        {PROMPT_EDITOR_COLLAPSE_LABEL}
      </button>
    </div>
  );
}
