import { agentsCountLabel } from "../../../../../../words";
import { Hairline, PickerShell } from "../../../../../../components";
import { ChosenCheck } from "./components";
import {
  PICKER_COUNT_FONT_SIZE_PX,
  PICKER_NAME_COLOR,
  PICKER_NAME_FONT_SIZE_PX,
  PICKER_ROW_BORDER_RADIUS_PX,
  PICKER_ROW_CHOSEN_BACKGROUND_COLOR,
  PICKER_ROW_COUNT_COLOR,
  PICKER_ROW_GAP_PX,
  PICKER_ROW_PADDING,
  PICKER_VALUE_COLOR,
} from "../../../../../../components/picker-shell/constants";
import { PROMPT_PICKER_NONE_COLOR, PROMPT_PICKER_NONE_LABEL, PROMPT_PICKER_RULE_MARGIN } from "./constants";
import type { PromptPickerProps } from "./interfaces";

/** Prompt choice; count = agents on it, this one included. «Без промпта» first, cut by a rule. */
export function PromptPicker({
  prompts,
  agents,
  promptId,
  isChanged = false,
  isLost = false,
  fieldRef,
  onPromptIdChange,
}: PromptPickerProps) {
  const chosen = prompts.find((prompt) => prompt.id === promptId) ?? null;
  const standingOn = (prompt: string) => agents.filter((agent) => agent.promptId === prompt).length;

  return (
    <PickerShell
      fieldRef={fieldRef}
      field={
        <>
          <span className="flex-fill text-truncate">{isLost ? "" : (chosen?.name ?? PROMPT_PICKER_NONE_LABEL)}</span>
          {chosen !== null && (
            <span
              className="font-monospace flex-shrink-0"
              style={{
                fontSize: PICKER_COUNT_FONT_SIZE_PX,
                color: PICKER_ROW_COUNT_COLOR,
              }}
            >
              {agentsCountLabel(standingOn(chosen.id))}
            </span>
          )}
        </>
      }
      fieldColor={chosen === null ? PROMPT_PICKER_NONE_COLOR : PICKER_VALUE_COLOR}
      isInvalid={isLost}
      isChanged={isChanged}
      items={prompts}
      matches={(prompt, query) => prompt.name.toLowerCase().includes(query)}
      lead={{
        row: (close) => (
          <button
            type="button"
            role="option"
            aria-selected={promptId === null}
            onClick={() => {
              onPromptIdChange(null);
              close();
            }}
            className="d-flex align-items-center text-start"
            style={{
              padding: PICKER_ROW_PADDING,
              gap: PICKER_ROW_GAP_PX,
              border: "none",
              borderRadius: PICKER_ROW_BORDER_RADIUS_PX,
              background: promptId === null ? PICKER_ROW_CHOSEN_BACKGROUND_COLOR : "transparent",
              color: PICKER_NAME_COLOR,
              fontSize: PICKER_NAME_FONT_SIZE_PX,
              cursor: "pointer",
            }}
          >
            <span className="flex-fill text-truncate">{PROMPT_PICKER_NONE_LABEL}</span>
            {promptId === null && <ChosenCheck />}
          </button>
        ),
        choose: (close) => {
          onPromptIdChange(null);
          close();
        },
      }}
      headRow={() => <Hairline margin={PROMPT_PICKER_RULE_MARGIN} />}
      choose={(prompt, close) => {
        onPromptIdChange(prompt.id);
        close();
      }}
      row={(prompt, close) => (
        <button
          key={prompt.id}
          type="button"
          role="option"
          aria-selected={prompt.id === promptId}
          onClick={() => {
            onPromptIdChange(prompt.id);
            close();
          }}
          className="d-flex align-items-center text-start"
          style={{
            padding: PICKER_ROW_PADDING,
            gap: PICKER_ROW_GAP_PX,
            border: "none",
            borderRadius: PICKER_ROW_BORDER_RADIUS_PX,
            background: prompt.id === promptId ? PICKER_ROW_CHOSEN_BACKGROUND_COLOR : "transparent",
            cursor: "pointer",
          }}
        >
          <span
            className="flex-fill text-truncate"
            style={{
              fontSize: PICKER_NAME_FONT_SIZE_PX,
              color: PICKER_NAME_COLOR,
            }}
          >
            {prompt.name}
          </span>
          <span
            className="font-monospace flex-shrink-0"
            style={{
              fontSize: PICKER_COUNT_FONT_SIZE_PX,
              color: PICKER_ROW_COUNT_COLOR,
            }}
          >
            {agentsCountLabel(standingOn(prompt.id))}
          </span>
          {prompt.id === promptId && <ChosenCheck />}
        </button>
      )}
    />
  );
}
