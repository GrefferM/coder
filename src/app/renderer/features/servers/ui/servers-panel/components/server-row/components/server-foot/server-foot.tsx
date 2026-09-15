import { useInteraction } from "../../../../../../../../hooks";
import { INTERACTION_TRANSITION } from "../../../../../../../../constants";
import { TextAction } from "../../../../../../../../components";
import { SERVER_DELETE_LABEL, SERVER_EDIT_LABEL } from "../../../../../../constants";
import {
  SERVER_FOOT_EDIT_BORDER_COLOR,
  SERVER_FOOT_EDIT_COLOR,
  SERVER_FOOT_EDIT_FONT_SIZE_PX,
  SERVER_FOOT_EDIT_LETTER_SPACING_PX,
  SERVER_FOOT_EDIT_LIT_BACKGROUND_COLOR,
  SERVER_FOOT_EDIT_PADDING,
  SERVER_FOOT_EDIT_RADIUS_PX,
  SERVER_FOOT_GAP_PX,
} from "../../constants";
import type { ServerFootProps } from "./interfaces";

/**
 * «Змінити» is not one of the state's actions, so it never stands in the head of a row, where at most one
 * action lives. It stands here, in the foot of the opened card, in the same place in every state — beside the
 * words of the failure on a fallen row. «Видалити» stands to its right and is not built yet.
 */
export function ServerFoot({ onEdit, onDelete }: ServerFootProps) {
  const { isLit, handlers } = useInteraction();

  return (
    <div
      className="d-flex align-items-center"
      style={{
        gap: SERVER_FOOT_GAP_PX,
      }}
    >
      {/* Its own button rather than a bordered box around a text action: only then is the padding its own too. */}
      <button
        type="button"
        onClick={onEdit}
        {...handlers}
        className="font-monospace text-uppercase"
        style={{
          padding: SERVER_FOOT_EDIT_PADDING,
          borderRadius: SERVER_FOOT_EDIT_RADIUS_PX,
          border: `1px solid ${SERVER_FOOT_EDIT_BORDER_COLOR}`,
          background: isLit ? SERVER_FOOT_EDIT_LIT_BACKGROUND_COLOR : "transparent",
          color: SERVER_FOOT_EDIT_COLOR,
          fontSize: SERVER_FOOT_EDIT_FONT_SIZE_PX,
          letterSpacing: SERVER_FOOT_EDIT_LETTER_SPACING_PX,
          cursor: "pointer",
          outline: "none",
          transition: INTERACTION_TRANSITION,
        }}
      >
        {SERVER_EDIT_LABEL}
      </button>
      {/* A bare word beside the framed one — their weights differ, and the red belongs to the box. */}
      <TextAction label={SERVER_DELETE_LABEL} onClick={onDelete} />
    </div>
  );
}
