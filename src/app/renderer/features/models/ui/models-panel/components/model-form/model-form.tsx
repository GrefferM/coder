import { useEffect, useRef, useState } from "react";
import { ActionButton, Field, FieldSlot, Mark, Segmented } from "../../../../../../components";
import {
  SETTING_ROW_HINT_COLOR,
  SETTING_ROW_HINT_LINE_HEIGHT,
} from "../../../../../../components/setting-row/constants";
import { FIELD_INVALID_MS, FIELD_PRICE_STEP } from "../../../../../../components/field/constants";
import { quietly } from "../../../../../../utils/writes";
import { isCeilingWrong, mendedField, modelBlocker } from "../../../../logic";
import {
  MODELS_PANEL_CREATE_LABEL,
  MODELS_PANEL_CANCEL_LABEL,
  MODELS_PANEL_GAP_PX,
  MODELS_PANEL_ANSWER_CEILING_FIELD_LABEL,
  MODELS_PANEL_ANSWER_CEILING_NOTE,
  MODELS_PANEL_ANSWER_CEILING_UNIT,
  MODELS_PANEL_ANSWER_CEILING_WRONG_NOTE,
  MODELS_PANEL_CEILING_FIELD_LABEL,
  MODELS_PANEL_CEILING_NOTE,
  MODELS_PANEL_CEILING_NOTE_NEW,
  MODELS_PANEL_CEILING_STEP,
  MODELS_PANEL_CEILING_UNIT,
  MODELS_PANEL_CEILING_WRONG_NOTE,
  MODELS_PANEL_INPUT_PRICE_FIELD_LABEL,
  MODELS_PANEL_OUTPUT_PRICE_FIELD_LABEL,
  MODELS_PANEL_PADDING_PX,
  MODELS_PANEL_SAVE_LABEL,
  MODEL_NAME_EXAMPLES,
  MODEL_NAME_NOTE_LOCAL,
  MODEL_NAME_NOTES,
  MODEL_NAME_NOTE_PREFIX,
  MODEL_NAME_NOTE_UNCHOSEN,
  MODELS_PANEL_TITLE_FIELD_LABEL,
  MODEL_KIND_FIELD_LABEL,
  MODEL_KIND_HINTS,
  MODEL_KIND_OPTIONS,
} from "../../constants";
import {
  MODEL_ANSWER_CEILING_LEAST,
  MODEL_ANSWER_CEILING_MOST,
  MODEL_CONTEXT_CEILING_LEAST,
  MODEL_CONTEXT_CEILING_MOST,
  SPEECH_LISTEN_PROVIDER_IDS,
} from "../../../../../../../../contracts";
import { ProviderPicker } from "./components";
import { MODEL_KIND_GAP_PX } from "./constants";
import type { ModelFormValues } from "../../../../interfaces";
import type { ModelFormProps } from "./interfaces";

/** Model create/edit form in the list's place; every way out asks about the section's draft. */
export function ModelForm({
  providers,
  values,
  saved,
  isNew,
  isMending,
  kindLock,
  onChange,
  onSave,
  onCancel,
}: ModelFormProps) {
  const [wasTried, setWasTried] = useState(false);
  const mended = useRef<HTMLInputElement>(null);
  // Sent here by a card, the cursor lands on the row the card named.
  const mendedRow = isMending ? mendedField(values) : null;

  useEffect(() => {
    mended.current?.focus();
  }, [mendedRow]);

  useEffect(() => {
    if (!wasTried) {
      return;
    }

    const fading = window.setTimeout(() => setWasTried(false), FIELD_INVALID_MS);

    return () => window.clearTimeout(fading);
  }, [wasTried]);

  const isMissing = (value: string) => wasTried && !value;
  const isText = values.kind === "text";
  /** A model that recognises speech is offered only the providers that can hear. */
  const offered = isText ? providers : providers.filter((provider) => SPEECH_LISTEN_PROVIDER_IDS.includes(provider.id));
  /**
   * A ceiling outside the bounds the file refuses; flagged as typed, unlike an empty required field, which is flagged at the
   * press.
   */
  const isContextCeilingWrong = isCeilingWrong(
    values.contextCeiling,
    MODEL_CONTEXT_CEILING_LEAST,
    MODEL_CONTEXT_CEILING_MOST,
  );
  const isAnswerCeilingWrong = isCeilingWrong(
    values.answerCeiling,
    MODEL_ANSWER_CEILING_LEAST,
    MODEL_ANSWER_CEILING_MOST,
  );

  /** Saved value a field moved away from; `null` when unmoved. */
  function wasValue(field: keyof ModelFormValues): string | null {
    if (saved === null || saved[field] === values[field]) {
      return null;
    }

    return saved[field];
  }

  async function save() {
    // Submit with blockers only marks them; the ceilings stand only on a text model.
    if (modelBlocker(values).length > 0 || (isText && (isContextCeilingWrong || isAnswerCeilingWrong))) {
      setWasTried(true);

      return;
    }

    await onSave();
  }

  // The chosen provider decides the name-format note.
  const chosen = providers.find((provider) => provider.id === values.provider) ?? null;
  const titleNote =
    chosen === null
      ? MODEL_NAME_NOTE_UNCHOSEN
      : (MODEL_NAME_NOTES[chosen.id] ??
        (chosen.kind === "local"
          ? MODEL_NAME_NOTE_LOCAL
          : `${MODEL_NAME_NOTE_PREFIX}${MODEL_NAME_EXAMPLES[chosen.id] ?? ""}`));

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        gap: MODELS_PANEL_GAP_PX,
        padding: MODELS_PANEL_PADDING_PX,
        overflowY: "auto",
      }}
    >
      <Field
        label={MODELS_PANEL_TITLE_FIELD_LABEL}
        note={titleNote}
        isInvalid={isMissing(values.title)}
        wasValue={wasValue("title")}
        value={values.title}
        onChange={(title) =>
          onChange({
            title,
          })
        }
      />
      <FieldSlot label={MODEL_KIND_FIELD_LABEL} wasValue={wasValue("kind")}>
        <div
          className="d-flex flex-column"
          style={{
            gap: MODEL_KIND_GAP_PX,
          }}
        >
          <Segmented
            options={MODEL_KIND_OPTIONS}
            value={values.kind}
            isDisabled={kindLock !== null}
            onChange={(kind) =>
              onChange({
                kind,
                // A provider that cannot do the new kind's work is let go rather than kept wrong.
                provider:
                  kind === "listen" && !SPEECH_LISTEN_PROVIDER_IDS.includes(values.provider) ? "" : values.provider,
              })
            }
          />
          {(kindLock ?? MODEL_KIND_HINTS[values.kind]) !== "" && (
            <Mark color={SETTING_ROW_HINT_COLOR} lineHeight={SETTING_ROW_HINT_LINE_HEIGHT} isUpperCase={false}>
              {kindLock ?? MODEL_KIND_HINTS[values.kind]}
            </Mark>
          )}
        </div>
      </FieldSlot>
      <ProviderPicker
        providers={offered}
        providerId={values.provider}
        wasProviderId={wasValue("provider")}
        isInvalid={isMissing(values.provider)}
        onChange={(provider) =>
          onChange({
            provider,
          })
        }
      />
      {/* A model that recognises speech has no ceilings and no prices. */}
      {isText && (
        <>
          <Field
            ref={mendedRow === "contextCeiling" ? mended : undefined}
            label={MODELS_PANEL_CEILING_FIELD_LABEL}
            note={
              isContextCeilingWrong
                ? MODELS_PANEL_CEILING_WRONG_NOTE
                : isNew
                  ? MODELS_PANEL_CEILING_NOTE_NEW
                  : MODELS_PANEL_CEILING_NOTE
            }
            unit={MODELS_PANEL_CEILING_UNIT}
            isInvalid={isMissing(values.contextCeiling) || isContextCeilingWrong}
            wasValue={wasValue("contextCeiling")}
            type="number"
            step={MODELS_PANEL_CEILING_STEP}
            isMono
            value={values.contextCeiling}
            onChange={(contextCeiling) =>
              onChange({
                contextCeiling,
              })
            }
          />
          <Field
            ref={mendedRow === "answerCeiling" ? mended : undefined}
            label={MODELS_PANEL_ANSWER_CEILING_FIELD_LABEL}
            note={isAnswerCeilingWrong ? MODELS_PANEL_ANSWER_CEILING_WRONG_NOTE : MODELS_PANEL_ANSWER_CEILING_NOTE}
            unit={MODELS_PANEL_ANSWER_CEILING_UNIT}
            isInvalid={isMissing(values.answerCeiling) || isAnswerCeilingWrong}
            wasValue={wasValue("answerCeiling")}
            type="number"
            step={MODELS_PANEL_CEILING_STEP}
            isMono
            value={values.answerCeiling}
            onChange={(answerCeiling) =>
              onChange({
                answerCeiling,
              })
            }
          />
          <Field
            ref={mendedRow === "inputPrice" ? mended : undefined}
            label={MODELS_PANEL_INPUT_PRICE_FIELD_LABEL}
            isInvalid={isMissing(values.inputPrice)}
            wasValue={wasValue("inputPrice")}
            type="number"
            step={FIELD_PRICE_STEP}
            value={values.inputPrice}
            onChange={(inputPrice) =>
              onChange({
                inputPrice,
              })
            }
          />
          <Field
            ref={mendedRow === "outputPrice" ? mended : undefined}
            label={MODELS_PANEL_OUTPUT_PRICE_FIELD_LABEL}
            isInvalid={isMissing(values.outputPrice)}
            wasValue={wasValue("outputPrice")}
            type="number"
            step={FIELD_PRICE_STEP}
            value={values.outputPrice}
            onChange={(outputPrice) =>
              onChange({
                outputPrice,
              })
            }
          />
        </>
      )}

      <div
        data-foot
        className="d-flex mt-auto"
        style={{
          gap: MODELS_PANEL_GAP_PX,
        }}
      >
        <ActionButton variant="cancel" label={MODELS_PANEL_CANCEL_LABEL} onClick={onCancel} />
        <ActionButton
          variant="save"
          label={isNew ? MODELS_PANEL_CREATE_LABEL : MODELS_PANEL_SAVE_LABEL}
          onClick={() => quietly(save)}
        />
      </div>
    </div>
  );
}
