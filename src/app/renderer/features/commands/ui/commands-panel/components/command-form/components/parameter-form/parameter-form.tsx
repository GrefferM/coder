import { useState } from "react";
import { Field, FieldSlot, NestedActions, Segmented, SettingRow, Toggle } from "../../../../../../../../components";
import {
  PARAMETER_FORM_BACKGROUND_COLOR,
  PARAMETER_FORM_BORDER_COLOR,
  PARAMETER_FORM_BORDER_RADIUS_PX,
  PARAMETER_FORM_CANCEL_LABEL,
  PARAMETER_FORM_CONFIRM_LABEL,
  PARAMETER_FORM_DESCRIPTION_LABEL,
  PARAMETER_FORM_DESCRIPTION_PLACEHOLDER,
  PARAMETER_FORM_ENUM_TYPE,
  PARAMETER_FORM_GAP_PX,
  PARAMETER_FORM_NAME_LABEL,
  PARAMETER_FORM_QUOTED_COLOR,
  PARAMETER_FORM_QUOTED_FONT_SIZE_PX,
  PARAMETER_FORM_QUOTED_GAP_PX,
  PARAMETER_FORM_QUOTED_ICON_RISE_PX,
  PARAMETER_FORM_QUOTED_ICON_SIZE_PX,
  PARAMETER_FORM_QUOTED_LETTER_SPACING_PX,
  PARAMETER_FORM_QUOTED_LINE_HEIGHT,
  PARAMETER_FORM_QUOTED_NOTE,
  PARAMETER_FORM_NAME_NOTE,
  PARAMETER_FORM_NAME_REFUSAL,
  PARAMETER_FORM_NAME_PLACEHOLDER,
  PARAMETER_FORM_NEW_TITLE,
  PARAMETER_FORM_OPEN_ANIMATION,
  PARAMETER_FORM_PADDING_PX,
  PARAMETER_FORM_REQUIRED_LABEL,
  PARAMETER_FORM_TITLE_COLOR,
  PARAMETER_FORM_TITLE_FONT_SIZE_PX,
  PARAMETER_FORM_TITLE_PREFIX,
  PARAMETER_FORM_TYPE_LABEL,
  PARAMETER_TYPE_OPTIONS,
} from "../../constants";
import { ValuesField } from "../values-field";
import { isSlotName } from "../../../../../../../../utils/text";
import { slotInQuotes } from "../../../../../../logic";
import type { CommandParameter } from "../../../../../../../../interfaces";
import type { ParameterFormProps } from "./interfaces";

/** The card declares a parameter or opens one, keeping its id; keystrokes go up as the preview's draft. */
export function ParameterForm({ parameter, run, onSubmit, onDraft, onCancel }: ParameterFormProps) {
  // New parameter's id, made once so the draft keeps the same row.
  const [newId] = useState(() => crypto.randomUUID());
  const [held, setHeld] = useState({
    name: parameter?.name ?? "",
    type: parameter?.type ?? PARAMETER_TYPE_OPTIONS[0].value,
    description: parameter?.description ?? "",
    isRequired: parameter?.isRequired ?? false,
    values: parameter?.values ?? [],
  });
  // A name that could not stand in the line's braces.
  const isNameWrong = held.name.trim() !== "" && !isSlotName(held.name.trim());
  const isFilled = held.name.trim() !== "" && held.description.trim() !== "" && !isNameWrong;

  /** The card's result row: existing id if opened on one, the new id otherwise. */
  function asParameter(from: typeof held): CommandParameter {
    return {
      id: parameter?.id ?? newId,
      name: from.name.trim(),
      type: from.type,
      description: from.description.trim(),
      isRequired: from.isRequired,
      // A non-enum type carries no values.
      values: from.type === PARAMETER_FORM_ENUM_TYPE ? from.values : [],
    };
  }

  /** One field change: held here and mirrored to the model-payload preview. */
  function change(patch: Partial<typeof held>) {
    const next = {
      ...held,
      ...patch,
    };

    setHeld(next);
    onDraft(asParameter(next));
  }

  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: PARAMETER_FORM_GAP_PX,
        padding: PARAMETER_FORM_PADDING_PX,
        borderRadius: PARAMETER_FORM_BORDER_RADIUS_PX,
        border: `1px solid ${PARAMETER_FORM_BORDER_COLOR}`,
        background: PARAMETER_FORM_BACKGROUND_COLOR,
        animation: PARAMETER_FORM_OPEN_ANIMATION,
      }}
    >
      <span
        className="text-truncate"
        style={{
          color: PARAMETER_FORM_TITLE_COLOR,
          fontSize: PARAMETER_FORM_TITLE_FONT_SIZE_PX,
          fontWeight: 600,
        }}
      >
        {parameter === null ? PARAMETER_FORM_NEW_TITLE : `${PARAMETER_FORM_TITLE_PREFIX}${parameter.name}`}
      </span>
      <Field
        label={PARAMETER_FORM_NAME_LABEL}
        value={held.name}
        placeholder={PARAMETER_FORM_NAME_PLACEHOLDER}
        note={isNameWrong ? PARAMETER_FORM_NAME_REFUSAL : PARAMETER_FORM_NAME_NOTE}
        isInvalid={isNameWrong}
        isMono
        onChange={(name) =>
          change({
            name,
          })
        }
      />
      <FieldSlot label={PARAMETER_FORM_TYPE_LABEL}>
        <Segmented
          options={PARAMETER_TYPE_OPTIONS}
          value={held.type}
          onChange={(type) =>
            change({
              type,
            })
          }
          isChips
        />
      </FieldSlot>
      {held.type === PARAMETER_FORM_ENUM_TYPE && (
        <ValuesField
          values={held.values}
          onChange={(values) =>
            change({
              values,
            })
          }
        />
      )}
      <Field
        label={PARAMETER_FORM_DESCRIPTION_LABEL}
        value={held.description}
        placeholder={PARAMETER_FORM_DESCRIPTION_PLACEHOLDER}
        isProse
        onChange={(description) =>
          change({
            description,
          })
        }
      />
      <SettingRow label={PARAMETER_FORM_REQUIRED_LABEL}>
        <Toggle
          label={PARAMETER_FORM_REQUIRED_LABEL}
          isOn={held.isRequired}
          onChange={(isRequired) =>
            change({
              isRequired,
            })
          }
        />
      </SettingRow>
      {/* Named only for an optional slot in quotes of its own. */}
      {!held.isRequired && slotInQuotes(run, held.name) && (
        <span
          className="d-flex font-monospace text-uppercase"
          style={{
            gap: PARAMETER_FORM_QUOTED_GAP_PX,
            color: PARAMETER_FORM_QUOTED_COLOR,
            fontSize: PARAMETER_FORM_QUOTED_FONT_SIZE_PX,
            letterSpacing: PARAMETER_FORM_QUOTED_LETTER_SPACING_PX,
            lineHeight: PARAMETER_FORM_QUOTED_LINE_HEIGHT,
          }}
        >
          <svg
            width={PARAMETER_FORM_QUOTED_ICON_SIZE_PX}
            height={PARAMETER_FORM_QUOTED_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={PARAMETER_FORM_QUOTED_COLOR}
            strokeWidth="2.4"
            strokeLinecap="round"
            style={{
              flexShrink: 0,
              marginTop: PARAMETER_FORM_QUOTED_ICON_RISE_PX,
            }}
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.5h.01" />
          </svg>
          {PARAMETER_FORM_QUOTED_NOTE}
        </span>
      )}
      <NestedActions
        cancelLabel={PARAMETER_FORM_CANCEL_LABEL}
        confirmLabel={PARAMETER_FORM_CONFIRM_LABEL}
        isConfirmDisabled={!isFilled}
        onCancel={onCancel}
        onConfirm={() => onSubmit(asParameter(held))}
      />
    </div>
  );
}
