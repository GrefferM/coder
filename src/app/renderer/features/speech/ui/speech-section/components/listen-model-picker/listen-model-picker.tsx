import { FieldSlot, LostRow, LostTie, Mark, PickerShell, TextButton } from "../../../../../../components";
import {
  PICKER_NAME_COLOR,
  PICKER_NAME_FONT_SIZE_PX,
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
import { providerMissing, PROVIDER_KEY_WRITTEN_LABEL } from "../../../../../providers";
import { NOT_FILLED_LABEL } from "../../../../../../constants";
import {
  HEARING_LOST_NAME,
  HEARING_LOST_NOTE,
  HEARING_MODEL_LABEL,
  HEARING_NONE_ACT,
  HEARING_NONE_NOTE,
  MAC_HEARING_DENIED_NOTE,
  MAC_HEARING_DENIED_TITLE,
  MAC_HEARING_KEPT_PREFIX,
  MAC_HEARING_ROW_NOTE,
  MAC_HEARING_TITLE,
  MAC_HEARING_WAITING_NOTE,
  MICROPHONE_SETTINGS_ACT,
  VOICE_NAME_SEPARATOR,
} from "../../../../constants";
import {
  LISTEN_MODEL_GAP_PX,
  LISTEN_MODEL_NONE_ACT_TONE,
  LISTEN_MODEL_NONE_COLOR,
  MAC_DENIED_COLOR,
  MAC_DENIED_FONT_SIZE_PX,
  MAC_DENIED_LINE_HEIGHT,
  MAC_QUIET_COLOR,
  MAC_ROW_DIVIDER_COLOR,
} from "./constants";
import type { ProjectModel } from "../../../../../../interfaces";
import type { ListenModelPickerProps } from "./interfaces";

/**
 * Who hears a recording: macOS on this machine (38d), or one of the project's recognition models; chosen, never typed,
 * and written at once.
 */
export function ListenModelPicker({
  models,
  providers,
  modelId,
  isMacChosen,
  mac,
  onChange,
  onChooseMac,
  onOpenModels,
}: ListenModelPickerProps) {
  const chosen = models.find((model) => model.id === modelId) ?? null;
  const isLost = !isMacChosen && modelId !== null && chosen === null;
  const isMacDenied = isMacChosen && mac.permission === "denied";
  const providerOf = (model: ProjectModel) => providers.find((provider) => provider.id === model.provider) ?? null;

  function fieldColor(): string {
    if (isMacDenied) {
      return MAC_DENIED_COLOR;
    }

    return isMacChosen || chosen !== null ? PICKER_VALUE_COLOR : PICKER_PLACEHOLDER_COLOR;
  }

  /** What stands under macOS's field: the wait for its window, its refusal, or the model the project keeps. */
  function macUnder() {
    if (mac.isAsking) {
      return <Mark color={MAC_QUIET_COLOR}>{MAC_HEARING_WAITING_NOTE}</Mark>;
    }

    if (isMacDenied) {
      return (
        <span
          style={{
            color: MAC_DENIED_COLOR,
            fontSize: MAC_DENIED_FONT_SIZE_PX,
            lineHeight: MAC_DENIED_LINE_HEIGHT,
          }}
        >
          {MAC_HEARING_DENIED_NOTE}{" "}
          <TextButton tone={LISTEN_MODEL_NONE_ACT_TONE} onPress={mac.openSettings}>
            {MICROPHONE_SETTINGS_ACT}
          </TextButton>
        </span>
      );
    }

    if (chosen === null) {
      return null;
    }

    return (
      <Mark color={MAC_QUIET_COLOR} isUpperCase={false}>
        {`${MAC_HEARING_KEPT_PREFIX}${chosen.title}`}
      </Mark>
    );
  }

  /** A model's provider by name, and whether it still lacks anything to hear with. */
  function note(model: ProjectModel): string {
    const provider = providerOf(model);

    if (provider === null) {
      return model.provider;
    }

    const missing = providerMissing(provider);

    return [provider.name, ...(missing.length === 0 ? [PROVIDER_KEY_WRITTEN_LABEL] : missing)].join(
      VOICE_NAME_SEPARATOR,
    );
  }

  return (
    <FieldSlot label={HEARING_MODEL_LABEL}>
      <div
        className="d-flex flex-column"
        style={{
          gap: LISTEN_MODEL_GAP_PX,
        }}
      >
        <PickerShell
          isInvalid={isLost || isMacDenied}
          field={
            isMacChosen ? (
              <span className="flex-fill head-truncate font-monospace">
                {isMacDenied ? MAC_HEARING_DENIED_TITLE : MAC_HEARING_TITLE}
              </span>
            ) : (
              <>
                <span className="flex-fill head-truncate font-monospace">
                  {isLost ? "" : (chosen?.title ?? NOT_FILLED_LABEL)}
                </span>
                {chosen !== null && (
                  <Mark
                    color={PICKER_ROW_COUNT_COLOR}
                    spacing={PICKER_ROW_NOTE_LETTER_SPACING_PX}
                    className="flex-shrink-0"
                  >
                    {providerOf(chosen)?.name ?? chosen.provider}
                  </Mark>
                )}
              </>
            )
          }
          fieldColor={fieldColor()}
          items={models}
          matches={(model, query) => model.title.toLowerCase().includes(query)}
          lead={{
            choose: (close) => {
              onChooseMac();
              close();
            },
            row: (close) => (
              <button
                type="button"
                role="option"
                aria-selected={isMacChosen}
                onClick={() => {
                  onChooseMac();
                  close();
                }}
                className="d-flex flex-column text-start w-100"
                style={{
                  padding: PICKER_ROW_PADDING,
                  gap: PICKER_ROW_TEXT_GAP_PX,
                  border: "none",
                  borderBottom: `1px solid ${MAC_ROW_DIVIDER_COLOR}`,
                  borderRadius: PICKER_ROW_BORDER_RADIUS_PX,
                  background: isMacChosen ? PICKER_ROW_CHOSEN_BACKGROUND_COLOR : "transparent",
                  cursor: "pointer",
                }}
              >
                <span
                  className="font-monospace head-truncate"
                  style={{
                    fontSize: PICKER_NAME_FONT_SIZE_PX,
                    color: PICKER_NAME_COLOR,
                  }}
                >
                  {MAC_HEARING_TITLE}
                </span>
                <Mark color={PICKER_ROW_NOTE_COLOR} spacing={PICKER_ROW_NOTE_LETTER_SPACING_PX}>
                  {MAC_HEARING_ROW_NOTE}
                </Mark>
              </button>
            ),
          }}
          choose={(model, close) => {
            onChange(model.id);
            close();
          }}
          row={(model, close) => (
            <button
              key={model.id}
              type="button"
              role="option"
              aria-selected={!isMacChosen && model.id === modelId}
              onClick={() => {
                onChange(model.id);
                close();
              }}
              className="d-flex align-items-center text-start"
              style={{
                padding: PICKER_ROW_PADDING,
                gap: PICKER_ROW_GAP_PX,
                border: "none",
                borderRadius: PICKER_ROW_BORDER_RADIUS_PX,
                background: !isMacChosen && model.id === modelId ? PICKER_ROW_CHOSEN_BACKGROUND_COLOR : "transparent",
                cursor: "pointer",
              }}
            >
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
                  className="text-truncate"
                >
                  {note(model)}
                </Mark>
              </span>
            </button>
          )}
        />

        {isMacChosen && macUnder()}

        {isLost && (
          <LostTie note={HEARING_LOST_NOTE}>
            <LostRow name={HEARING_LOST_NAME} />
          </LostTie>
        )}

        {/* Nothing to choose from: the field says so and leads where a recognition model is made. */}
        {!isMacChosen && models.length === 0 && (
          <span
            className="d-flex flex-wrap align-items-center"
            style={{
              gap: LISTEN_MODEL_GAP_PX,
            }}
          >
            <Mark color={LISTEN_MODEL_NONE_COLOR} isUpperCase={false}>
              {HEARING_NONE_NOTE}
            </Mark>
            <TextButton tone={LISTEN_MODEL_NONE_ACT_TONE} onPress={onOpenModels}>
              {HEARING_NONE_ACT}
            </TextButton>
          </span>
        )}
      </div>
    </FieldSlot>
  );
}
