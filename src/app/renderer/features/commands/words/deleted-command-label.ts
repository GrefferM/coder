import { ukrainianPlural } from "../../../utils/text";
import { DELETED_COMMAND_GONE_FORMS, DELETED_COMMAND_GRANT_FORMS, DELETED_COMMAND_LABEL } from "../constants";

/** The undo line names the grants that went with the command. */
export function deletedCommandLabel(grants: number): string {
  if (grants === 0) {
    return DELETED_COMMAND_LABEL;
  }

  const [one, few, many] = DELETED_COMMAND_GRANT_FORMS;
  const [goneOne, goneFew, goneMany] = DELETED_COMMAND_GONE_FORMS;
  const grant = ukrainianPlural(grants, one, few, many);

  return `${DELETED_COMMAND_LABEL} · ${grants} ${grant} ${ukrainianPlural(grants, goneOne, goneFew, goneMany)}`;
}
