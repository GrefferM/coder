import { parametersCountLabel } from "../words";
import {
  COMMAND_DESCRIPTION_CHANGE_LABEL,
  COMMAND_DESCRIPTION_DROPPED_LABEL,
  COMMAND_NAME_CHANGE_LABEL,
  COMMAND_NAME_DROPPED_LABEL,
  COMMAND_PARAMETERS_CHANGE_LABEL,
  COMMAND_PARAMETERS_DROPPED_LABEL,
  COMMAND_RUN_CHANGE_LABEL,
  COMMAND_RUN_DROPPED_LABEL,
} from "../constants";
import type { FieldChange } from "../../../interfaces";
import type { CommandFormValues } from "../interfaces";

/** Fields of a command's form changed from the saved values; parameters compare as a count. */
export function commandChanges(saved: CommandFormValues, form: CommandFormValues): FieldChange[] {
  const written: FieldChange[] = [
    {
      label: COMMAND_NAME_CHANGE_LABEL,
      droppedLabel: COMMAND_NAME_DROPPED_LABEL,
      was: saved.name,
      now: form.name,
    },
    {
      label: COMMAND_DESCRIPTION_CHANGE_LABEL,
      droppedLabel: COMMAND_DESCRIPTION_DROPPED_LABEL,
      was: saved.description,
      now: form.description,
    },
    {
      label: COMMAND_RUN_CHANGE_LABEL,
      droppedLabel: COMMAND_RUN_DROPPED_LABEL,
      was: saved.run,
      now: form.run,
    },
    {
      label: COMMAND_PARAMETERS_CHANGE_LABEL,
      droppedLabel: COMMAND_PARAMETERS_DROPPED_LABEL,
      was: parametersCountLabel(saved.parameters.length),
      now: parametersCountLabel(form.parameters.length),
    },
  ];

  return written.filter((change) => change.was !== change.now);
}
