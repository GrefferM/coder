import { useState } from "react";
import { useWindowKeydown } from "../../../../hooks";
import { promptBlocker } from "../../logic";
import { NAME_TAKEN_PROMPT_NOTE, PROMPT_EDITOR_LAYER } from "../../../../constants";
import { RAIL_WIDTH_PX, SIDE_PANEL_GAP_PX } from "../../../../components/side-panel/constants";
import { wordCount } from "../../../../utils/text";
import {
  PROMPT_EDITOR_BACKGROUND_COLOR,
  PROMPT_EDITOR_BODY_GAP_PX,
  PROMPT_EDITOR_BODY_PADDING,
  PROMPT_EDITOR_BORDER_RADIUS_PX,
  PROMPT_EDITOR_INSET_PX,
  PROMPT_EDITOR_TEXT_BACKGROUND_COLOR,
  PROMPT_EDITOR_TEXT_BORDER_COLOR,
  PROMPT_EDITOR_TEXT_BORDER_RADIUS_PX,
  PROMPT_EDITOR_TEXT_COLOR,
  PROMPT_EDITOR_TEXT_FONT_SIZE_PX,
  PROMPT_EDITOR_TEXT_LINE_HEIGHT,
  PROMPT_EDITOR_TEXT_PADDING,
  PROMPT_EDITOR_TEXT_PLACEHOLDER,
} from "./constants";
import { QuietLine, WasLine } from "../../../../components/field-slot/components";
import { EditorFoot, EditorHead, EditorName } from "./components";
import type { PromptEditorProps } from "./interfaces";
import { quietly } from "../../../../utils/writes";

/** System prompt across the working area; the name is a word until clicked; every exit asks about unsaved work. */
export function PromptEditor({
  values,
  wasName,
  isNameTaken,
  isNew,
  hasUnsaved,
  agentNames,
  onChange,
  onSave,
  onClose,
  onCancel,
}: PromptEditorProps) {
  const words = wordCount(values.text);

  const [isRenaming, setIsRenaming] = useState(isNew);

  // Escape closes, as printed on the chip.
  useWindowKeydown(true, (event) => {
    if (event.key === "Escape") {
      onClose();
    }
  });

  async function save() {
    // A taken name is treated like an empty one: the field opens and the line under it says whose.
    if (promptBlocker(values).length > 0 || isNameTaken) {
      setIsRenaming(true);

      return;
    }

    // Writing closes the editor without asking.
    await onSave();
  }

  return (
    <div
      className="d-flex flex-column"
      style={{
        position: "absolute",
        top: PROMPT_EDITOR_INSET_PX,
        bottom: PROMPT_EDITOR_INSET_PX,
        left: PROMPT_EDITOR_INSET_PX,
        right: RAIL_WIDTH_PX + SIDE_PANEL_GAP_PX * 2,
        zIndex: PROMPT_EDITOR_LAYER,
        borderRadius: PROMPT_EDITOR_BORDER_RADIUS_PX,
        background: PROMPT_EDITOR_BACKGROUND_COLOR,
        overflow: "hidden",
      }}
    >
      <EditorHead name={values.name} words={words} hasUnsaved={hasUnsaved} onClose={onClose} />

      <div
        className="d-flex flex-column flex-fill"
        style={{
          gap: PROMPT_EDITOR_BODY_GAP_PX,
          padding: PROMPT_EDITOR_BODY_PADDING,
          minHeight: 0,
        }}
      >
        <EditorName
          name={values.name}
          wasName={wasName}
          isRenaming={isRenaming}
          onRenaming={setIsRenaming}
          onRename={(renamed) =>
            onChange({
              name: renamed,
            })
          }
        />
        {isNameTaken && <QuietLine>{NAME_TAKEN_PROMPT_NOTE}</QuietLine>}
        {wasName !== null && <WasLine value={wasName} />}
        <textarea
          aria-label={PROMPT_EDITOR_TEXT_PLACEHOLDER}
          value={values.text}
          placeholder={PROMPT_EDITOR_TEXT_PLACEHOLDER}
          onChange={(event) =>
            onChange({
              text: event.target.value,
            })
          }
          className="flex-fill"
          style={{
            resize: "none",
            padding: PROMPT_EDITOR_TEXT_PADDING,
            borderRadius: PROMPT_EDITOR_TEXT_BORDER_RADIUS_PX,
            border: `1px solid ${PROMPT_EDITOR_TEXT_BORDER_COLOR}`,
            background: PROMPT_EDITOR_TEXT_BACKGROUND_COLOR,
            color: PROMPT_EDITOR_TEXT_COLOR,
            fontSize: PROMPT_EDITOR_TEXT_FONT_SIZE_PX,
            lineHeight: PROMPT_EDITOR_TEXT_LINE_HEIGHT,
            outline: "none",
            minHeight: 0,
          }}
        />
      </div>

      <EditorFoot agentNames={agentNames} onCancel={onCancel} onSave={() => quietly(save)} />
    </div>
  );
}
