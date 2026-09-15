import { ConfirmDialog, Words } from "../../../../components";
import { sharedLabels } from "../../../../utils/text";
import { changedFieldsNote, droppedFieldsNote, missingFieldsNote } from "../../words";
import {
  UNSAVED_AGENT_DECLINE_LABEL,
  UNSAVED_AGENT_DIFF_ARROW,
  UNSAVED_AGENT_DIFF_BACKGROUND_COLOR,
  UNSAVED_AGENT_DIFF_BORDER_RADIUS_PX,
  UNSAVED_AGENT_DIFF_FONT_SIZE_PX,
  UNSAVED_AGENT_DIFF_GAP_PX,
  UNSAVED_AGENT_DIFF_LABEL_COLOR,
  UNSAVED_AGENT_DIFF_LETTERS_MOST,
  UNSAVED_AGENT_DIFF_NEW_COLOR,
  UNSAVED_AGENT_DIFF_OLD_COLOR,
  UNSAVED_AGENT_DIFF_PADDING,
  UNSAVED_AGENT_DIFF_SEPARATOR,
  UNSAVED_AGENT_DROP_QUESTION,
  UNSAVED_AGENT_QUESTION_PREFIX,
  UNSAVED_AGENT_QUESTION_SUFFIX,
  UNSAVED_AGENT_SAVE_LABEL,
  UNSAVED_AGENT_STAY_LABEL,
} from "./constants";
import type { UnsavedAgentConfirmProps } from "./interfaces";

/** The ask on every way out of an unsaved agent, fields written `було → стало`. */
export function UnsavedAgentConfirm({
  name,
  changes,
  blocked,
  blockedNote,
  ask,
  onSave,
  onDiscard,
  onStay,
}: UnsavedAgentConfirmProps) {
  const isDrop = ask === "drop";
  // A draft the file would refuse has no «Зберегти» to press.
  const isSavable = blocked.length === 0 && blockedNote === null;

  return (
    <ConfirmDialog
      tone="calm"
      question={
        isDrop ? UNSAVED_AGENT_DROP_QUESTION : `${UNSAVED_AGENT_QUESTION_PREFIX}${name}${UNSAVED_AGENT_QUESTION_SUFFIX}`
      }
      noLabel={UNSAVED_AGENT_DECLINE_LABEL}
      yesLabel={isSavable ? UNSAVED_AGENT_SAVE_LABEL : null}
      stayLabel={UNSAVED_AGENT_STAY_LABEL}
      onConfirm={onSave}
      onDecline={onDiscard}
      onDismiss={onStay}
    >
      <Words>
        {!isSavable
          ? (blockedNote ?? missingFieldsNote(blocked))
          : isDrop
            ? droppedFieldsNote(changes.map((change) => change.droppedLabel))
            : changedFieldsNote(changes.map((change) => change.droppedLabel))}
      </Words>
      <div
        className="d-flex flex-column font-monospace"
        style={{
          gap: UNSAVED_AGENT_DIFF_GAP_PX,
          padding: UNSAVED_AGENT_DIFF_PADDING,
          borderRadius: UNSAVED_AGENT_DIFF_BORDER_RADIUS_PX,
          background: UNSAVED_AGENT_DIFF_BACKGROUND_COLOR,
          fontSize: UNSAVED_AGENT_DIFF_FONT_SIZE_PX,
        }}
      >
        {changes.map((change) => {
          // The line's room is what the label and the arrow leave; the two values share it between them.
          const [was, now] = sharedLabels(
            change.was,
            change.now,
            UNSAVED_AGENT_DIFF_LETTERS_MOST -
              change.label.length -
              UNSAVED_AGENT_DIFF_SEPARATOR.length -
              UNSAVED_AGENT_DIFF_ARROW.length,
          );

          return (
            <div
              key={change.label}
              className="d-flex text-uppercase"
              style={{
                gap: UNSAVED_AGENT_DIFF_GAP_PX,
                color: UNSAVED_AGENT_DIFF_LABEL_COLOR,
              }}
            >
              <span className="flex-shrink-0">{`${change.label}${UNSAVED_AGENT_DIFF_SEPARATOR}`}</span>
              {/* A value here is whatever the person typed: it is cut to its share of the line, whole on the pointer. */}
              <span
                className="text-truncate"
                title={change.was}
                style={{
                  color: UNSAVED_AGENT_DIFF_OLD_COLOR,
                }}
              >
                {was}
              </span>
              <span className="flex-shrink-0">{UNSAVED_AGENT_DIFF_ARROW}</span>
              <span
                className="text-truncate"
                title={change.now}
                style={{
                  color: UNSAVED_AGENT_DIFF_NEW_COLOR,
                }}
              >
                {now}
              </span>
            </div>
          );
        })}
      </div>
    </ConfirmDialog>
  );
}
