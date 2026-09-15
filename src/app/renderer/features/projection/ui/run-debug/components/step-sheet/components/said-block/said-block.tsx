import {
  STEP_SHEET_ANSWER_COLOR,
  STEP_SHEET_BLOCK_GAP_PX,
  STEP_SHEET_BLOCK_PADDING,
  STEP_SHEET_LABEL_COLOR,
  STEP_SHEET_TAKEN_COLOR,
  STEP_SHEET_TEXT_FONT_SIZE_PX,
  STEP_SHEET_TEXT_LINE_HEIGHT,
} from "../../constants";
import { Mark } from "../../../../../../../../components";
import type { SaidBlockProps } from "./interfaces";

/**
 * Words of the open step in a row under a mono label — what came into it, and what it answered. No box
 * around them: a box is how the chat speaks, and this is a record.
 */
export function SaidBlock({ label, text, isAnswer }: SaidBlockProps) {
  return (
    <div
      className="d-flex flex-column flex-shrink-0"
      style={{
        gap: STEP_SHEET_BLOCK_GAP_PX,
        padding: STEP_SHEET_BLOCK_PADDING,
      }}
    >
      <Mark color={STEP_SHEET_LABEL_COLOR} isUpperCase={false}>
        {label}
      </Mark>
      <span
        style={{
          color: isAnswer ? STEP_SHEET_ANSWER_COLOR : STEP_SHEET_TAKEN_COLOR,
          fontSize: STEP_SHEET_TEXT_FONT_SIZE_PX,
          lineHeight: STEP_SHEET_TEXT_LINE_HEIGHT,
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </span>
    </div>
  );
}
