import { ConfirmDialog, Dot, Words } from "../../../../components";
import { deletedModelNote } from "../../words";
import {
  DELETE_MODEL_CHIP_BACKGROUND_COLOR,
  DELETE_MODEL_CHIP_BORDER_COLOR,
  DELETE_MODEL_CHIP_BORDER_RADIUS_PX,
  DELETE_MODEL_CHIP_COLOR,
  DELETE_MODEL_CHIP_DOT_SIZE_PX,
  DELETE_MODEL_CHIP_FONT_SIZE_PX,
  DELETE_MODEL_CHIP_GAP_PX,
  DELETE_MODEL_CHIP_LETTER_SPACING_PX,
  DELETE_MODEL_CHIP_PADDING,
  DELETE_MODEL_EMPTY_NOTE,
  DELETE_MODEL_EMPTY_QUESTION_PREFIX,
  DELETE_MODEL_EMPTY_QUESTION_SUFFIX,
  DELETE_MODEL_EMPTY_YES_LABEL,
  DELETE_MODEL_QUESTION,
} from "./constants";
import type { DeleteModelConfirmProps } from "./interfaces";

/** Model deletion — agents on it go along, in the danger tone; nobody on it, the question quieter. */
export function DeleteModelConfirm({ title, agents, onConfirm, onDismiss }: DeleteModelConfirmProps) {
  const isEmpty = agents.length === 0;

  return (
    <ConfirmDialog
      question={
        isEmpty
          ? `${DELETE_MODEL_EMPTY_QUESTION_PREFIX}${title}${DELETE_MODEL_EMPTY_QUESTION_SUFFIX}`
          : DELETE_MODEL_QUESTION
      }
      tone={isEmpty ? "calm" : "danger"}
      yesLabel={isEmpty ? DELETE_MODEL_EMPTY_YES_LABEL : undefined}
      // Taking a declaration away is not the act the box is for, so it stands outlined.
      yesVariant={isEmpty ? "outlined" : undefined}
      // Nothing behind the box is going, so nothing behind it darkens.
      hasScrim={!isEmpty}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    >
      <Words>{isEmpty ? DELETE_MODEL_EMPTY_NOTE : deletedModelNote(title, agents.length)}</Words>
      {!isEmpty && (
        <div
          className="d-flex flex-wrap"
          style={{
            gap: DELETE_MODEL_CHIP_GAP_PX,
          }}
        >
          {agents.map((agent) => (
            <span
              key={agent.id}
              className="d-flex align-items-center font-monospace text-uppercase"
              style={{
                maxWidth: "100%",
                minWidth: 0,
                gap: DELETE_MODEL_CHIP_GAP_PX,
                padding: DELETE_MODEL_CHIP_PADDING,
                borderRadius: DELETE_MODEL_CHIP_BORDER_RADIUS_PX,
                border: `1px solid ${DELETE_MODEL_CHIP_BORDER_COLOR}`,
                background: DELETE_MODEL_CHIP_BACKGROUND_COLOR,
                color: DELETE_MODEL_CHIP_COLOR,
                fontSize: DELETE_MODEL_CHIP_FONT_SIZE_PX,
                letterSpacing: DELETE_MODEL_CHIP_LETTER_SPACING_PX,
              }}
            >
              <Dot color={agent.color} size={DELETE_MODEL_CHIP_DOT_SIZE_PX} />
              <span className="text-truncate">{agent.name}</span>
            </span>
          ))}
        </div>
      )}
    </ConfirmDialog>
  );
}
