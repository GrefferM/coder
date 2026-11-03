import { FieldSlot, LostRow, LostTie, Mark, PickerShell } from "../../../../../../../../components";
import {
  PICKER_NAME_COLOR,
  PICKER_NAME_FONT_SIZE_PX,
  PICKER_PLACEHOLDER_COLOR,
  PICKER_ROW_BORDER_RADIUS_PX,
  PICKER_ROW_CHOSEN_BACKGROUND_COLOR,
  PICKER_ROW_GAP_PX,
  PICKER_ROW_NOTE_COLOR,
  PICKER_ROW_NOTE_LETTER_SPACING_PX,
  PICKER_ROW_PADDING,
  PICKER_ROW_TEXT_GAP_PX,
  PICKER_VALUE_COLOR,
} from "../../../../../../../../components/picker-shell/constants";
import {
  providerMissing,
  PROVIDER_KEY_WRITTEN_LABEL,
  PROVIDER_LOCAL_LABEL,
  PROVIDER_REMOTE_LABEL,
} from "../../../../../../../providers";
import { MODELS_PANEL_PROVIDER_FIELD_LABEL } from "../../../../constants";
import { PROVIDER_OFF_SUFFIX } from "../../../../../../../../constants";
import {
  PROVIDER_PICKER_GAP_PX,
  PROVIDER_PICKER_LOST_NAME,
  PROVIDER_PICKER_LOST_NOTE,
  PROVIDER_PICKER_NOTE_SEPARATOR,
  PROVIDER_PICKER_PLACEHOLDER,
} from "./constants";
import type { ProviderState } from "../../../../../../../../interfaces";
import type { ProviderPickerProps } from "./interfaces";

/** Which provider a model belongs to, chosen from the known list. */
export function ProviderPicker({ providers, providerId, wasProviderId, isInvalid, onChange }: ProviderPickerProps) {
  const nameOf = (id: string) => providers.find((provider) => provider.id === id)?.name ?? id;
  const chosen = providers.find((provider) => provider.id === providerId) ?? null;
  // A provider the file names but the app lacks: the usual broken tie.
  const isLost = chosen === null && providerId !== "";
  // The was-value shows the display name, not the file's word.
  const wasValue = wasProviderId === null ? null : nameOf(wasProviderId);

  /** Line under a provider's name: its kind and, for a remote one, what it still lacks. */
  function note(provider: ProviderState): string {
    if (provider.kind === "local") {
      return PROVIDER_LOCAL_LABEL;
    }

    const missing = providerMissing(provider);
    const reach = missing.length === 0 ? PROVIDER_KEY_WRITTEN_LABEL : missing.join(PROVIDER_PICKER_NOTE_SEPARATOR);

    return `${PROVIDER_REMOTE_LABEL}${PROVIDER_PICKER_NOTE_SEPARATOR}${reach}`;
  }

  /** Said after a provider turned off on this machine, in its row and in the field. */
  function offSuffix(provider: ProviderState): string {
    return provider.isOff ? PROVIDER_OFF_SUFFIX : "";
  }

  return (
    <FieldSlot label={MODELS_PANEL_PROVIDER_FIELD_LABEL} wasValue={wasValue}>
      <div
        className="d-flex flex-column"
        style={{
          gap: PROVIDER_PICKER_GAP_PX,
        }}
      >
        <PickerShell
          isInvalid={isInvalid || isLost}
          isChanged={wasValue !== null}
          field={
            <span className="flex-fill text-truncate">
              {isLost ? "" : chosen === null ? PROVIDER_PICKER_PLACEHOLDER : `${chosen.name}${offSuffix(chosen)}`}
            </span>
          }
          fieldColor={chosen === null ? PICKER_PLACEHOLDER_COLOR : PICKER_VALUE_COLOR}
          items={providers}
          matches={(provider, query) => provider.name.toLowerCase().includes(query)}
          choose={(provider, close) => {
            onChange(provider.id);
            close();
          }}
          row={(provider, close) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => {
                onChange(provider.id);
                close();
              }}
              className="d-flex align-items-center text-start"
              style={{
                padding: PICKER_ROW_PADDING,
                gap: PICKER_ROW_GAP_PX,
                borderRadius: PICKER_ROW_BORDER_RADIUS_PX,
                border: "none",
                background: provider.id === providerId ? PICKER_ROW_CHOSEN_BACKGROUND_COLOR : "transparent",
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
                  style={{
                    color: PICKER_NAME_COLOR,
                    fontSize: PICKER_NAME_FONT_SIZE_PX,
                  }}
                >
                  {provider.name}
                </span>
                <Mark color={PICKER_ROW_NOTE_COLOR} spacing={PICKER_ROW_NOTE_LETTER_SPACING_PX} isUpperCase={false}>
                  {`${note(provider)}${offSuffix(provider)}`}
                </Mark>
              </span>
            </button>
          )}
        />

        {isLost && (
          <LostTie note={PROVIDER_PICKER_LOST_NOTE}>
            <LostRow name={PROVIDER_PICKER_LOST_NAME} />
          </LostTie>
        )}
      </div>
    </FieldSlot>
  );
}
