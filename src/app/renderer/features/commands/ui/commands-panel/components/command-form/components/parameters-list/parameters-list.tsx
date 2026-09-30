import { CatalogueAction } from "../../../../../../../../components";
import { ParameterForm } from "../parameter-form";
import { ParameterRow } from "../parameter-row";
import {
  FIELD_LABEL_COLOR,
  FIELD_LABEL_FONT_SIZE_PX,
  FIELD_LABEL_GAP_PX,
} from "../../../../../../../../components/field/constants";
import {
  COMMAND_FORM_ADD_PARAMETER_LABEL,
  COMMAND_FORM_NEW_PARAMETER_ID,
  COMMAND_FORM_PARAMETERS_GAP_PX,
  COMMAND_FORM_PARAMETERS_LABEL,
} from "../../constants";
import type { ParametersListProps } from "./interfaces";

/** The command's parameters: a row each, the open one as a card, and the add action. */
export function ParametersList({
  parameters,
  run,
  usedNames,
  openParameterId,
  onOpen,
  onSubmit,
  onDraft,
  onRemove,
  onCancel,
}: ParametersListProps) {
  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: COMMAND_FORM_PARAMETERS_GAP_PX,
      }}
    >
      <span
        className="text-uppercase font-monospace"
        style={{
          color: FIELD_LABEL_COLOR,
          fontSize: FIELD_LABEL_FONT_SIZE_PX,
          marginBottom: FIELD_LABEL_GAP_PX - COMMAND_FORM_PARAMETERS_GAP_PX,
        }}
      >
        {COMMAND_FORM_PARAMETERS_LABEL}
      </span>
      {parameters.map((parameter) =>
        parameter.id === openParameterId ? (
          <ParameterForm
            run={run}
            key={parameter.id}
            parameter={parameter}
            onSubmit={onSubmit}
            onDraft={onDraft}
            onCancel={onCancel}
          />
        ) : (
          <ParameterRow
            key={parameter.id}
            parameter={parameter}
            isUsed={usedNames.includes(parameter.name)}
            onOpen={() => onOpen(parameter.id)}
            onRemove={() => onRemove(parameter.id)}
          />
        ),
      )}
      {openParameterId === COMMAND_FORM_NEW_PARAMETER_ID ? (
        <ParameterForm parameter={null} run={run} onSubmit={onSubmit} onDraft={onDraft} onCancel={onCancel} />
      ) : (
        <CatalogueAction
          label={COMMAND_FORM_ADD_PARAMETER_LABEL}
          isDashed
          onClick={() => onOpen(COMMAND_FORM_NEW_PARAMETER_ID)}
        />
      )}
    </div>
  );
}
