import { EMPTY_COMMAND_FORM_VALUES } from "../constants";
import type { ProjectCommand } from "../../../interfaces";
import type { CommandFormValues } from "../interfaces";

/** A declared command as its form holds it, or empty fields for one that does not exist yet. */
export function commandFormValues(command: ProjectCommand | null): CommandFormValues {
  if (command === null) {
    return EMPTY_COMMAND_FORM_VALUES;
  }

  return {
    name: command.name,
    description: command.description,
    run: command.run,
    parameters: command.parameters,
  };
}
