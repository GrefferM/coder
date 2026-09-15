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
 * «ЗМІННІ СЕРЕДОВИЩА». One variable is a name and a value, and they go to two different places — the
 * name into the project file, which travels into a repository, and the value into this machine's keychain, which
 * does not. A variable with no value anywhere says so on its own block, because a server missing one will
 * not start at all, and the catalogue's row says the same thing later in the same words.
 *
 * Each variable is its own **box** and not a row: the tab is a narrow column, and three things in a line come
 * out too short to read a key in. The head carries the count, and the dashed row under the last block is both
 * the way to add a variable and the visible end of the list.
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
