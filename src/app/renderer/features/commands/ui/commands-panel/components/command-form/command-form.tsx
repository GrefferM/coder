import { useEffect, useRef, useState } from "react";
import { ActionButton, Field, ModelPreview, TemplateField } from "../../../../../../components";
import { FIELD_INVALID_MS } from "../../../../../../components/field/constants";
import { commandBlocker } from "../../../../logic";
import { nameTaken } from "../../../../../../logic";
import { isFunctionNameWrong } from "../../../../logic";
import { NAME_TAKEN_COMMAND_NOTE } from "../../../../../../constants";
import { MODEL_PREVIEW_DECLARED_NOTE } from "../../../../../../components/model-preview/constants";
import { quietly } from "../../../../../../utils/writes";
import { slotNames } from "../../../../../../utils/text";
import {
  COMMANDS_PANEL_CANCEL_LABEL,
  COMMANDS_PANEL_DECLARE_LABEL,
  COMMANDS_PANEL_DESCRIPTION_FIELD_LABEL,
  COMMANDS_PANEL_DESCRIPTION_PLACEHOLDER,
  COMMANDS_PANEL_GAP_PX,
  COMMANDS_PANEL_NAME_FIELD_LABEL,
  COMMANDS_PANEL_NAME_FIELD_NOTE,
  COMMANDS_PANEL_NAME_PLACEHOLDER,
  COMMANDS_PANEL_PADDING_PX,
  COMMANDS_PANEL_RUN_FIELD_LABEL,
  COMMANDS_PANEL_RUN_FIELD_NOTE,
  COMMANDS_PANEL_RUN_PLACEHOLDER,
  COMMANDS_PANEL_SAVE_LABEL,
} from "../../constants";
import { ParametersList, RunFacts } from "./components";

import type { CommandParameter } from "../../../../../../interfaces";
import type { CommandFormProps } from "./interfaces";

/** Command form — name, description, run line, and the parameters its braces stand for. */
export function CommandForm({ values, isNew, takenNames, onChange, onSave, onCancel }: CommandFormProps) {
  const [wasTried, setWasTried] = useState(false);
  // Open card's parameter id — "new" while one is being declared.
  const [openParameterId, setOpenParameterId] = useState<string | null>(null);
  // Open card's current draft; read only by the model-payload preview block.
  const [draftParameter, setDraftParameter] = useState<CommandParameter | null>(null);

  useEffect(() => {
    if (!wasTried) {
      return;
    }

    const fading = window.setTimeout(() => setWasTried(false), FIELD_INVALID_MS);

    return () => window.clearTimeout(fading);
  }, [wasTried]);

  const isMissing = (value: string) => wasTried && !value.trim();
  const isTaken = nameTaken(values.name, takenNames);
  /**
   * The field keeps every typed character, says what is wrong, and refuses the save until it fits. It judges only what is
   * typed here, not a name already declared in the file.
   */
  const opened = useRef(values.name);
  const isNameWrong = isFunctionNameWrong(values.name) && values.name !== opened.current;
  // A declared parameter the run line never names is marked, not refused.
  const usedNames = slotNames(values.run);
  const slots = values.parameters.map((parameter) => ({
    name: parameter.name,
    type: parameter.type,
    isUsed: usedNames.includes(parameter.name),
  }));
  const openParameter = values.parameters.find((parameter) => parameter.id === openParameterId) ?? null;
  const shown = draftParameter !== null && draftParameter.name !== "" ? draftParameter : null;
  const previewParameters =
    shown === null
      ? values.parameters
      : values.parameters.some((parameter) => parameter.id === shown.id)
        ? values.parameters.map((parameter) => (parameter.id === shown.id ? shown : parameter))
        : [...values.parameters, shown];

  /** Writes the card's row into the draft — in place if opened on one, appended if new. */
  function submitParameter(parameter: CommandParameter) {
    onChange({
      parameters:
        openParameter === null
          ? [...values.parameters, parameter]
          : values.parameters.map((standing) => (standing.id === parameter.id ? parameter : standing)),
    });
    closeCard();
  }

  function removeParameter(parameterId: string) {
    onChange({
      parameters: values.parameters.filter((standing) => standing.id !== parameterId),
    });
    closeCard();
  }

  /** Closes the card and drops its draft. */
  function closeCard() {
    setOpenParameterId(null);
    setDraftParameter(null);
  }

  async function save() {
    // Submit with something missing only marks it.
    if (commandBlocker(values).length > 0 || isTaken || isNameWrong) {
      setWasTried(true);

      return;
    }

    await onSave();
  }

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        gap: COMMANDS_PANEL_GAP_PX,
        padding: COMMANDS_PANEL_PADDING_PX,
        overflowY: "auto",
      }}
    >
      <Field
        label={COMMANDS_PANEL_NAME_FIELD_LABEL}
        value={values.name}
        placeholder={COMMANDS_PANEL_NAME_PLACEHOLDER}
        note={isTaken ? NAME_TAKEN_COMMAND_NOTE : COMMANDS_PANEL_NAME_FIELD_NOTE}
        isMono
        isInvalid={isMissing(values.name) || isTaken || isNameWrong}
        onChange={(name) =>
          onChange({
            name,
          })
        }
      />
      <Field
        label={COMMANDS_PANEL_DESCRIPTION_FIELD_LABEL}
        value={values.description}
        placeholder={COMMANDS_PANEL_DESCRIPTION_PLACEHOLDER}
        isProse
        isInvalid={isMissing(values.description)}
        onChange={(description) =>
          onChange({
            description,
          })
        }
      />
      <TemplateField
        label={COMMANDS_PANEL_RUN_FIELD_LABEL}
        value={values.run}
        placeholder={COMMANDS_PANEL_RUN_PLACEHOLDER}
        note={COMMANDS_PANEL_RUN_FIELD_NOTE}
        isInvalid={isMissing(values.run)}
        slots={slots}
        onChange={(run) =>
          onChange({
            run,
          })
        }
      />

      {/* The responsibility border stands under the run line it is about, before the parameters. */}
      <RunFacts />

      <ParametersList
        parameters={values.parameters}
        run={values.run}
        usedNames={usedNames}
        openParameterId={openParameterId}
        onOpen={setOpenParameterId}
        onSubmit={submitParameter}
        onDraft={setDraftParameter}
        onRemove={removeParameter}
        onCancel={closeCard}
      />

      <ModelPreview
        name={values.name}
        description={values.description}
        parameters={previewParameters}
        note={MODEL_PREVIEW_DECLARED_NOTE}
      />

      <div
        data-foot
        className="d-flex mt-auto"
        style={{
          gap: COMMANDS_PANEL_GAP_PX,
        }}
      >
        <ActionButton variant="cancel" label={COMMANDS_PANEL_CANCEL_LABEL} onClick={onCancel} />
        <ActionButton
          variant="save"
          label={isNew ? COMMANDS_PANEL_DECLARE_LABEL : COMMANDS_PANEL_SAVE_LABEL}
          onClick={() => quietly(save)}
        />
      </div>
    </div>
  );
}
