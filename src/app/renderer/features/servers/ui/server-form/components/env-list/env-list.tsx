import { AddVariable, EnvBlock } from "./components";
import { FieldSlot, Hairline, Words } from "../../../../../../components";
import { functionName } from "../../../../../../logic";
import {
  SERVER_FORM_ENV_COUNT_SEPARATOR,
  SERVER_FORM_ENV_GAP_PX,
  SERVER_FORM_ENV_LABEL,
  SERVER_FORM_ENV_NOTE,
} from "../../constants";
import { FIELD_LABEL_GAP_PX } from "../../../../../../components/field/constants";
import type { EnvListProps } from "./interfaces";

/**
 * «ЗМІННІ СЕРЕДОВИЩА». A variable is a name and a value: the name goes into the project file, the value into this
 * machine's keychain. One with no value says so on its block.
 */
export function EnvList({ names, drafts, held, onNamesChange, onValueChange }: EnvListProps) {
  function rename(at: number, name: string) {
    onNamesChange(names.map((standing, other) => (other === at ? functionName(name) : standing)));
  }

  const label =
    names.length === 0
      ? SERVER_FORM_ENV_LABEL
      : `${SERVER_FORM_ENV_LABEL}${SERVER_FORM_ENV_COUNT_SEPARATOR}${names.length}`;

  return (
    <FieldSlot label={label} action={<Hairline className="flex-fill" margin={`0 0 0 ${FIELD_LABEL_GAP_PX}px`} />}>
      <div
        className="d-flex flex-column"
        style={{
          gap: SERVER_FORM_ENV_GAP_PX,
        }}
      >
        {names.map((name, at) => (
          <EnvBlock
            key={at}
            name={name}
            draft={drafts[name]}
            heldHint={held[name]}
            onNameChange={(typed) => rename(at, typed)}
            onValueChange={(value) => onValueChange(name, value)}
            onRemove={() => onNamesChange(names.filter((_, other) => other !== at))}
          />
        ))}

        <AddVariable onAdd={() => onNamesChange([...names, ""])} />
      </div>

      <Words isQuiet>{SERVER_FORM_ENV_NOTE}</Words>
    </FieldSlot>
  );
}
