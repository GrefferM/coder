import { FieldSlot } from "../../../../../../../../components";
import { ColorPicker } from "../../../color-picker";
import { ModelPicker } from "../../../model-picker";
import { PromptPicker } from "../../../prompt-picker";
import { LostModel } from "../lost-model";
import { LostPrompt } from "../lost-prompt";
import {
  AGENT_SETTINGS_COLOR_LABEL,
  AGENT_SETTINGS_MODEL_LABEL,
  AGENT_SETTINGS_PROMPT_LABEL,
  AGENT_SETTINGS_TIE_GAP_PX,
} from "../../constants";
import type { SettingsTiesProps } from "./interfaces";

/** What the agent is tied to: model, prompt and colour, each showing its previous value. */
export function SettingsTies({
  draft,
  was,
  models,
  prompts,
  agents,
  isModelGone,
  isPromptGone,
  goneProviderId,
  offProviderName,
  offModelIds,
  mendedField,
  onDraftChange,
}: SettingsTiesProps) {
  return (
    <>
      <FieldSlot label={AGENT_SETTINGS_MODEL_LABEL} wasValue={was.model}>
        <div
          className="d-flex flex-column"
          style={{
            gap: AGENT_SETTINGS_TIE_GAP_PX,
          }}
        >
          <ModelPicker
            models={models}
            agents={agents}
            modelId={draft.modelId}
            isChanged={was.model !== null}
            isLost={isModelGone}
            lostProviderId={goneProviderId}
            offProviderName={offProviderName}
            offModelIds={offModelIds}
            onModelIdChange={(modelId) =>
              onDraftChange({
                modelId,
              })
            }
          />

          {isModelGone && <LostModel />}
        </div>
      </FieldSlot>

      <FieldSlot label={AGENT_SETTINGS_PROMPT_LABEL} wasValue={was.prompt}>
        <div
          className="d-flex flex-column"
          style={{
            gap: AGENT_SETTINGS_TIE_GAP_PX,
          }}
        >
          <PromptPicker
            fieldRef={mendedField}
            prompts={prompts}
            agents={agents}
            promptId={draft.promptId}
            isChanged={was.prompt !== null}
            isLost={isPromptGone}
            onPromptIdChange={(promptId) =>
              onDraftChange({
                promptId,
              })
            }
          />

          {isPromptGone && (
            <LostPrompt
              onRemove={() =>
                onDraftChange({
                  promptId: null,
                })
              }
            />
          )}
        </div>
      </FieldSlot>

      <FieldSlot label={AGENT_SETTINGS_COLOR_LABEL} wasValue={was.color}>
        <ColorPicker
          color={draft.color}
          isChanged={was.color !== null}
          onColorChange={(color) =>
            onDraftChange({
              color,
            })
          }
        />
      </FieldSlot>
    </>
  );
}
