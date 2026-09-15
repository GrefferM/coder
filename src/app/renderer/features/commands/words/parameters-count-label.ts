import { ukrainianPlural } from "../../../utils/text";
import { COMMAND_PARAMETER_FORMS, NO_COMMAND_PARAMETERS_LABEL } from "../constants";

/** Parameter count for a command's row; zero is said in words, not as a number. */
export function parametersCountLabel(count: number): string {
  if (count === 0) {
    return NO_COMMAND_PARAMETERS_LABEL;
  }

  const [one, few, many] = COMMAND_PARAMETER_FORMS;

  return `${count} ${ukrainianPlural(count, one, few, many)}`;
}
