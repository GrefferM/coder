import { ukrainianPlural } from "../../../utils/text";
import { DELETED_SERVER_GONE_FORMS, DELETED_SERVER_GRANT_FORMS, DELETED_SERVER_LABEL } from "../constants";

/** The undo line's shape, for a server: the undo line names the grants that went with it. */
export function deletedServerLabel(grants: number): string {
  if (grants === 0) {
    return DELETED_SERVER_LABEL;
  }

  const [one, few, many] = DELETED_SERVER_GRANT_FORMS;
  const [goneOne, goneFew, goneMany] = DELETED_SERVER_GONE_FORMS;
  const grant = ukrainianPlural(grants, one, few, many);

  return `${DELETED_SERVER_LABEL} · ${grants} ${grant} ${ukrainianPlural(grants, goneOne, goneFew, goneMany)}`;
}
