import {
  SERVER_ADDRESS_CHANGE_LABEL,
  SERVER_FORM_LOCAL_LABEL,
  SERVER_FORM_NO_SIGN_IN_LABEL,
  SERVER_FORM_REMOTE_LABEL,
  SERVER_FORM_TOKEN_LABEL,
  SERVER_KIND_CHANGE_LABEL,
  SERVER_NAME_CHANGE_LABEL,
  SERVER_RUN_CHANGE_LABEL,
  SERVER_SIGN_IN_CHANGE_LABEL,
} from "../constants";
import type { FieldChange } from "../../../interfaces";
import type { ServerFormValues } from "../interfaces";

/** The form fields changed from the saved ones; the half the switch does not point at is not compared. */
export function serverChanges(saved: ServerFormValues, form: ServerFormValues): FieldChange[] {
  const written: FieldChange[] = [
    {
      label: SERVER_NAME_CHANGE_LABEL,
      droppedLabel: SERVER_NAME_CHANGE_LABEL,
      was: saved.name,
      now: form.name,
    },
    {
      label: SERVER_KIND_CHANGE_LABEL,
      droppedLabel: SERVER_KIND_CHANGE_LABEL,
      was: kindOf(saved.isLocal),
      now: kindOf(form.isLocal),
    },
    ...(form.isLocal
      ? [
          {
            label: SERVER_RUN_CHANGE_LABEL,
            droppedLabel: SERVER_RUN_CHANGE_LABEL,
            was: saved.run,
            now: form.run,
          },
        ]
      : [
          {
            label: SERVER_ADDRESS_CHANGE_LABEL,
            droppedLabel: SERVER_ADDRESS_CHANGE_LABEL,
            was: saved.address,
            now: form.address,
          },
          {
            label: SERVER_SIGN_IN_CHANGE_LABEL,
            droppedLabel: SERVER_SIGN_IN_CHANGE_LABEL,
            was: wayInOf(saved.signIn),
            now: wayInOf(form.signIn),
          },
        ]),
  ];

  return written.filter((change) => change.was !== change.now);
}

function kindOf(isLocal: boolean): string {
  return isLocal ? SERVER_FORM_LOCAL_LABEL : SERVER_FORM_REMOTE_LABEL;
}

function wayInOf(signIn: string): string {
  return signIn === "none" ? SERVER_FORM_NO_SIGN_IN_LABEL : SERVER_FORM_TOKEN_LABEL;
}
