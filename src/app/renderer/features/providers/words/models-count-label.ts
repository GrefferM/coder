import { ukrainianPlural } from "../../../utils/text";
import { MODEL_FORMS, NO_MODELS_LABEL } from "../../../constants";

/** Model count in Ukrainian forms; zero is spelled out. */
export function modelsCountLabel(count: number): string {
  if (count === 0) {
    return NO_MODELS_LABEL;
  }

  const [one, few, many] = MODEL_FORMS;

  return `${count} ${ukrainianPlural(count, one, few, many)}`;
}
