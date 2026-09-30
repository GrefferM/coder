import { ConfirmDialog, Dot, Words } from "../../../../components";
import { deletedPromptNote } from "../../words";
import { DELETED_PROMPT_QUESTION_PREFIX, DELETED_PROMPT_QUESTION_SUFFIX } from "../../constants";
import {
  DELETE_PROMPT_CHIP_BACKGROUND_COLOR,
  DELETE_PROMPT_CHIP_BORDER_COLOR,
  DELETE_PROMPT_CHIP_BORDER_RADIUS_PX,
  DELETE_PROMPT_CHIP_COLOR,
  DELETE_PROMPT_CHIP_DOT_SIZE_PX,
  DELETE_PROMPT_CHIP_FONT_SIZE_PX,
  DELETE_PROMPT_CHIP_GAP_PX,
  DELETE_PROMPT_CHIP_LETTER_SPACING_PX,
  DELETE_PROMPT_CHIP_PADDING,
} from "./constants";
import type { DeletePromptConfirmProps } from "./interfaces";

/** Prompt-deletion question; its agents fall to the bare model and are named on chips. */
export function DeletePromptConfirm({ prompt, agents, onConfirm, onDismiss }: DeletePromptConfirmProps) {
  return (
    <ConfirmDialog
      question={`${DELETED_PROMPT_QUESTION_PREFIX}${prompt.name}${DELETED_PROMPT_QUESTION_SUFFIX}`}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    >
      <Words>{deletedPromptNote(prompt.name, agents.length)}</Words>
      {agents.length > 0 && (
        <div
          className="d-flex flex-wrap"
          style={{
            gap: DELETE_PROMPT_CHIP_GAP_PX,
          }}
        >
          {agents.map((agent) => (
            <span
              key={agent.id}
              className="d-flex align-items-center font-monospace text-uppercase"
              style={{
                maxWidth: "100%",
                minWidth: 0,
                gap: DELETE_PROMPT_CHIP_GAP_PX,
                padding: DELETE_PROMPT_CHIP_PADDING,
                borderRadius: DELETE_PROMPT_CHIP_BORDER_RADIUS_PX,
                border: `1px solid ${DELETE_PROMPT_CHIP_BORDER_COLOR}`,
                background: DELETE_PROMPT_CHIP_BACKGROUND_COLOR,
                color: DELETE_PROMPT_CHIP_COLOR,
                fontSize: DELETE_PROMPT_CHIP_FONT_SIZE_PX,
                letterSpacing: DELETE_PROMPT_CHIP_LETTER_SPACING_PX,
              }}
            >
              <Dot color={agent.color} size={DELETE_PROMPT_CHIP_DOT_SIZE_PX} />
              <span className="text-truncate">{agent.name}</span>
            </span>
          ))}
        </div>
      )}
    </ConfirmDialog>
  );
}
