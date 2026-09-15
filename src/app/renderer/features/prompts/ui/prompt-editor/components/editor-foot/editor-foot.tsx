import { ActionButton, Mark } from "../../../../../../components";
import { ukrainianPlural } from "../../../../../../utils/text";
import {
  PROMPT_EDITOR_ACTIONS_WIDTH_PX,
  PROMPT_EDITOR_AGENTS_PREFIX,
  PROMPT_EDITOR_AGENTS_SEPARATOR,
  PROMPT_EDITOR_CANCEL_LABEL,
  PROMPT_EDITOR_FOOTER_BORDER_COLOR,
  PROMPT_EDITOR_FOOTER_GAP_PX,
  PROMPT_EDITOR_FOOTER_PADDING,
  PROMPT_EDITOR_NO_AGENTS_LABEL,
  PROMPT_EDITOR_SAVE_LABEL,
  PROMPT_EDITOR_AGENT_FORMS,
} from "../../constants";
import type { EditorFootProps } from "./interfaces";

/** The editor's foot — whom this prompt is on, and the two acts that end the editing. */
export function EditorFoot({ agentNames, onCancel, onSave }: EditorFootProps) {
  const [agentOne, agentFew, agentMany] = PROMPT_EDITOR_AGENT_FORMS;

  return (
    <div
      className="d-flex align-items-center flex-shrink-0"
      style={{
        gap: PROMPT_EDITOR_FOOTER_GAP_PX,
        padding: PROMPT_EDITOR_FOOTER_PADDING,
        borderTop: `1px solid ${PROMPT_EDITOR_FOOTER_BORDER_COLOR}`,
      }}
    >
      <Mark className="text-truncate">
        {agentNames.length === 0
          ? PROMPT_EDITOR_NO_AGENTS_LABEL
          : `${PROMPT_EDITOR_AGENTS_PREFIX} ${agentNames.length} ${ukrainianPlural(
              agentNames.length,
              agentOne,
              agentFew,
              agentMany,
            )}: ${agentNames.join(PROMPT_EDITOR_AGENTS_SEPARATOR)}`}
      </Mark>
      <span className="flex-fill" />
      <div
        data-foot
        className="d-flex flex-shrink-0"
        style={{
          gap: PROMPT_EDITOR_FOOTER_GAP_PX,
          width: PROMPT_EDITOR_ACTIONS_WIDTH_PX,
        }}
      >
        <ActionButton variant="cancel" label={PROMPT_EDITOR_CANCEL_LABEL} onClick={onCancel} />
        <ActionButton variant="save" label={PROMPT_EDITOR_SAVE_LABEL} onClick={onSave} />
      </div>
    </div>
  );
}
