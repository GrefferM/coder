import { agentsCountLabel, priceLabel } from "../../../../../../words";
import { Mark, PickerShell } from "../../../../../../components";
import {
  PICKER_DOT_SIZE_PX,
  PICKER_NAME_COLOR,
  PICKER_NAME_FONT_SIZE_PX,
  PICKER_OPEN_BORDER_COLOR,
  PICKER_PLACEHOLDER_COLOR,
  PICKER_ROW_BORDER_RADIUS_PX,
  PICKER_ROW_CHOSEN_BACKGROUND_COLOR,
  PICKER_ROW_COUNT_COLOR,
  PICKER_ROW_GAP_PX,
  PICKER_ROW_NOTE_COLOR,
  PICKER_ROW_NOTE_LETTER_SPACING_PX,
  PICKER_ROW_PADDING,
  PICKER_ROW_TEXT_GAP_PX,
  PICKER_VALUE_COLOR,
} from "../../../../../../components/picker-shell/constants";
import { MODEL_PICKER_LOST_GAP_PX, MODEL_PICKER_LOST_LETTER_SPACING_PX, MODEL_PICKER_PLACEHOLDER } from "./constants";
import { LOST_PROVIDER_COLOR, LOST_PROVIDER_SUFFIX, PROVIDER_OFF_SUFFIX } from "../../../../../../constants";
import type { ModelPickerProps } from "./interfaces";

/** Model choice: project models with prices and agent counts, in the shared picker shell. */
export function ModelPicker({
  models,
  agents,
  modelId,
  isInvalid = false,
  isLost = false,
  lostProviderId = null,
  offProviderName = null,
  offModelIds = [],
  isChanged = false,
  onModelIdChange,
}: ModelPickerProps) {
  const chosen = models.find((model) => model.id === modelId) ?? null;

  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: MODEL_PICKER_LOST_GAP_PX,
      }}
    >
      <PickerShell
        field={
          <span className="flex-fill head-truncate">{isLost ? "" : (chosen?.title ?? MODEL_PICKER_PLACEHOLDER)}</span>
        }
        fieldColor={chosen ? PICKER_VALUE_COLOR : PICKER_PLACEHOLDER_COLOR}
        isInvalid={isInvalid || isLost || lostProviderId !== null}
        isChanged={isChanged}
        items={models}
        matches={(model, query) => model.title.toLowerCase().includes(query)}
        choose={(model, close) => {
          onModelIdChange(model.id);
          close();
        }}
        row={(model, close) => (
          <button
            key={model.id}
            type="button"
            role="option"
            aria-selected={model.id === modelId}
            onClick={() => {
              onModelIdChange(model.id);
              close();
            }}
            className="d-flex align-items-center text-start"
            style={{
              padding: PICKER_ROW_PADDING,
              gap: PICKER_ROW_GAP_PX,
              border: "none",
              borderRadius: PICKER_ROW_BORDER_RADIUS_PX,
              background: model.id === modelId ? PICKER_ROW_CHOSEN_BACKGROUND_COLOR : "transparent",
              cursor: "pointer",
            }}
          >
            <span
              className="flex-shrink-0 rounded-circle"
              style={{
                width: PICKER_DOT_SIZE_PX,
                height: PICKER_DOT_SIZE_PX,
                background: model.id === modelId ? PICKER_OPEN_BORDER_COLOR : PICKER_ROW_COUNT_COLOR,
              }}
            />
            <span
              className="d-flex flex-column flex-fill"
              style={{
                gap: PICKER_ROW_TEXT_GAP_PX,
                minWidth: 0,
              }}
            >
              <span
                className="font-monospace head-truncate"
                style={{
                  fontSize: PICKER_NAME_FONT_SIZE_PX,
                  color: PICKER_NAME_COLOR,
                }}
              >
                {model.title}
              </span>
              <Mark
                color={PICKER_ROW_NOTE_COLOR}
                spacing={PICKER_ROW_NOTE_LETTER_SPACING_PX}
                isUpperCase={false}
                className="text-truncate"
              >
                {`${priceLabel(model)}${offModelIds.includes(model.id) ? PROVIDER_OFF_SUFFIX : ""}`}
              </Mark>
            </span>
            <Mark
              color={PICKER_ROW_COUNT_COLOR}
              spacing={PICKER_ROW_NOTE_LETTER_SPACING_PX}
              isUpperCase={false}
              className="flex-shrink-0"
            >
              {agentsCountLabel(agents.filter((agent) => agent.modelId === model.id).length)}
            </Mark>
          </button>
        )}
      />

      {lostProviderId !== null && (
        <Mark
          color={LOST_PROVIDER_COLOR}
          spacing={MODEL_PICKER_LOST_LETTER_SPACING_PX}
          isUpperCase={false}
        >{`${lostProviderId}${LOST_PROVIDER_SUFFIX}`}</Mark>
      )}

      {offProviderName !== null && (
        <Mark
          color={LOST_PROVIDER_COLOR}
          spacing={MODEL_PICKER_LOST_LETTER_SPACING_PX}
          isUpperCase={false}
        >{`${offProviderName}${PROVIDER_OFF_SUFFIX}`}</Mark>
      )}
    </div>
  );
}
