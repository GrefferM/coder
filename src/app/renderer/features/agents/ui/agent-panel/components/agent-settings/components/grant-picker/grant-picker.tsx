import { PickerShell } from "../../../../../../../../components";
import {
  PICKER_PLACEHOLDER_COLOR,
  PICKER_VALUE_COLOR,
} from "../../../../../../../../components/picker-shell/constants";
import { ToolOption } from "../tool-option";
import { grantFor, grantedOf } from "./logic";
import { GRANT_PICKER_CHOSEN_JOIN, GRANT_PICKER_LIST_MAX_HEIGHT_PX } from "./constants";
import type { ToolChoice } from "../../../../../../interfaces";
import type { GrantPickerProps } from "./interfaces";

/** The grant field of a tools section: the closed field counts what is granted of all, a tick grants and revokes. */
export function GrantPicker({
  options,
  grants,
  chooseLabel,
  chosenTail,
  isChanged,
  fieldRef,
  openedBy,
  onGrantsChange,
}: GrantPickerProps) {
  const chosen = options.filter((option) => grantedOf(option, grants) !== null);

  /** Grants if not held, revokes if held; writes the whole draft, so other fields' grants stand. */
  function toggle(option: ToolChoice) {
    const granted = grantedOf(option, grants);

    onGrantsChange(
      granted === null ? [...grants, grantFor(option)] : grants.filter((grant) => grant.id !== granted.id),
    );
  }

  return (
    <PickerShell
      fieldRef={fieldRef}
      field={
        <span className="flex-fill text-truncate">
          {chosen.length === 0
            ? chooseLabel
            : `${chosen.length}${GRANT_PICKER_CHOSEN_JOIN}${options.length}${chosenTail}`}
        </span>
      }
      fieldColor={chosen.length === 0 ? PICKER_PLACEHOLDER_COLOR : PICKER_VALUE_COLOR}
      listMaxHeightPx={GRANT_PICKER_LIST_MAX_HEIGHT_PX}
      isChanged={isChanged}
      items={options}
      matches={(option, query) =>
        option.name.toLowerCase().includes(query) || option.description.toLowerCase().includes(query)
      }
      openedBy={openedBy}
      choose={(option) => toggle(option)}
      row={(option) => (
        <ToolOption
          key={option.key}
          name={option.name}
          isGranted={grantedOf(option, grants) !== null}
          onToggle={() => toggle(option)}
        />
      )}
    />
  );
}
