import { useEffect, useRef, useState } from "react";
import { ActionButton, Field } from "../../../../components";
import { ChoiceRow, EnvList } from "./components";
import { FIELD_INVALID_MS } from "../../../../components/field/constants";
import { nameTaken } from "../../../../logic";
import { isServerNameWrong } from "../../logic";
import { quietly } from "../../../../utils/writes";
import { serverBlocker } from "../../logic";
import {
  SERVER_FORM_LOCAL_LABEL,
  SERVER_FORM_NO_SIGN_IN_LABEL,
  SERVER_FORM_REMOTE_LABEL,
  SERVER_FORM_TOKEN_LABEL,
  SERVERS_SECTION_GAP_PX,
  SERVERS_SECTION_PADDING_PX,
} from "../../constants";
import {
  SERVER_FORM_ADDRESS_LABEL,
  SERVER_FORM_ADDRESS_PLACEHOLDER,
  SERVER_FORM_CANCEL_LABEL,
  SERVER_FORM_DECLARE_LABEL,
  SERVER_FORM_KIND_LABEL,
  SERVER_FORM_NAME_LABEL,
  SERVER_FORM_NAME_NOTE,
  SERVER_FORM_NAME_PLACEHOLDER,
  SERVER_FORM_RUN_LABEL,
  SERVER_FORM_RUN_NOTE,
  SERVER_FORM_RUN_PLACEHOLDER,
  SERVER_FORM_SAVE_LABEL,
  SERVER_FORM_SECRET_NOTE,
  SERVER_FORM_SIGN_IN_LABEL,
  SERVER_FORM_TOKEN_PLACEHOLDER,
} from "./constants";
import { NAME_TAKEN_COMMAND_NOTE } from "../../../../constants";
import type { ServerFormProps } from "./interfaces";

/**
 * The one form both kinds of server are declared in. The head switch picks the half asked for; the other half keeps
 * what was typed, and the file is written with only the half this server is.
 */
export function ServerForm({
  values,
  isNew,
  takenNames,
  held,
  secrets,
  onChange,
  onSecretChange,
  onSave,
  onCancel,
}: ServerFormProps) {
  const [wasTried, setWasTried] = useState(false);

  useEffect(() => {
    if (!wasTried) {
      return;
    }

    const fading = window.setTimeout(() => setWasTried(false), FIELD_INVALID_MS);

    return () => window.clearTimeout(fading);
  }, [wasTried]);

  const isTaken = nameTaken(values.name, takenNames);
  const isMissing = (value: string) => wasTried && !value.trim();
  // The token field's hint of what is already held, as nothing was typed.
  const token = secrets[""];
  const isTokenHeld = token === undefined && held.token !== null;

  /**
   * Typed text stays and the field refuses in words. The name rule is checked on what is typed, not on the file: an
   * already accepted name is the file's truth, so it does not block the run line.
   */
  const opened = useRef(values.name);
  const isNameWrong = isServerNameWrong(values.name) && values.name !== opened.current;

  async function save() {
    // Pressing with something missing marks the field, without a refusal in words.
    if (serverBlocker(values).length > 0 || isTaken || isNameWrong) {
      setWasTried(true);

      return;
    }

    await onSave();
  }

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        gap: SERVERS_SECTION_GAP_PX,
        padding: SERVERS_SECTION_PADDING_PX,
        overflowY: "auto",
      }}
    >
      <Field
        label={SERVER_FORM_NAME_LABEL}
        value={values.name}
        placeholder={SERVER_FORM_NAME_PLACEHOLDER}
        note={isTaken ? NAME_TAKEN_COMMAND_NOTE : SERVER_FORM_NAME_NOTE}
        isMono
        isInvalid={isMissing(values.name) || isTaken || isNameWrong}
        onChange={(name) =>
          onChange({
            name,
          })
        }
      />

      <ChoiceRow
        label={SERVER_FORM_KIND_LABEL}
        chosen={values.isLocal ? "local" : "remote"}
        choices={[
          {
            value: "local",
            label: SERVER_FORM_LOCAL_LABEL,
          },
          {
            value: "remote",
            label: SERVER_FORM_REMOTE_LABEL,
          },
        ]}
        onChoose={(where) =>
          onChange({
            isLocal: where === "local",
          })
        }
      />

      {values.isLocal ? (
        <Field
          label={SERVER_FORM_RUN_LABEL}
          value={values.run}
          placeholder={SERVER_FORM_RUN_PLACEHOLDER}
          note={SERVER_FORM_RUN_NOTE}
          isMono
          isInvalid={isMissing(values.run)}
          onChange={(run) =>
            onChange({
              run,
            })
          }
        />
      ) : (
        <>
          <Field
            label={SERVER_FORM_ADDRESS_LABEL}
            value={values.address}
            placeholder={SERVER_FORM_ADDRESS_PLACEHOLDER}
            isMono
            isInvalid={isMissing(values.address)}
            onChange={(address) =>
              onChange({
                address,
              })
            }
          />
          <ChoiceRow
            label={SERVER_FORM_SIGN_IN_LABEL}
            chosen={values.signIn}
            choices={[
              {
                value: "none",
                label: SERVER_FORM_NO_SIGN_IN_LABEL,
              },
              {
                value: "token",
                label: SERVER_FORM_TOKEN_LABEL,
              },
            ]}
            onChoose={(signIn) =>
              onChange({
                // The row offers exactly these two, so no cast is needed.
                signIn: signIn === "token" ? "token" : "none",
              })
            }
          />
          {values.signIn === "token" && (
            <Field
              label={SERVER_FORM_TOKEN_LABEL}
              value={token ?? ""}
              // The hint stays until something is typed or the cross is pressed.
              placeholder={isTokenHeld ? (held.token ?? "") : SERVER_FORM_TOKEN_PLACEHOLDER}
              note={held.token === null ? undefined : SERVER_FORM_SECRET_NOTE}
              isMono
              onClear={isTokenHeld ? () => onSecretChange("", "") : undefined}
              onChange={(typed) => onSecretChange("", typed)}
            />
          )}
        </>
      )}

      {values.isLocal && (
        <EnvList
          names={values.env}
          drafts={secrets}
          held={held.env}
          onNamesChange={(env) =>
            onChange({
              env,
            })
          }
          onValueChange={onSecretChange}
        />
      )}

      <div
        data-foot
        className="d-flex mt-auto"
        style={{
          gap: SERVERS_SECTION_GAP_PX,
        }}
      >
        <ActionButton variant="cancel" label={SERVER_FORM_CANCEL_LABEL} onClick={onCancel} />
        <ActionButton
          variant="save"
          label={isNew ? SERVER_FORM_DECLARE_LABEL : SERVER_FORM_SAVE_LABEL}
          onClick={() => quietly(save)}
        />
      </div>
    </div>
  );
}
