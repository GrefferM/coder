import { COMMAND_DESCRIPTION_DROPPED_LABEL, COMMAND_NAME_DROPPED_LABEL, COMMAND_RUN_DROPPED_LABEL } from "../constants";
import type { CommandFormValues } from "../interfaces";

/** Required fields still empty, by the names the leave question uses. */
export function commandBlocker(values: CommandFormValues): string[] {
  const missing: string[] = [];

  if (!values.name.trim()) {
    missing.push(COMMAND_NAME_DROPPED_LABEL);
  }

  if (!values.description.trim()) {
    missing.push(COMMAND_DESCRIPTION_DROPPED_LABEL);
  }

  if (!values.run.trim()) {
    missing.push(COMMAND_RUN_DROPPED_LABEL);
  }

  return missing;
}
