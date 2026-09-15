import { Field, Mark, TextAction } from "../../../../../../../../components";
import { QUIET_MARK_COLOR } from "../../../../../../../../constants";
import {
  SERVER_FORM_ENV_BLOCK_GAP_PX,
  SERVER_FORM_ENV_BLOCK_LABEL,
  SERVER_FORM_ENV_BOX_BACKGROUND_COLOR,
  SERVER_FORM_ENV_BOX_BORDER_COLOR,
  SERVER_FORM_ENV_BOX_PADDING_PX,
  SERVER_FORM_ENV_BOX_RADIUS_PX,
  SERVER_FORM_ENV_NAME_GOES,
  SERVER_FORM_ENV_NAME_LABEL,
  SERVER_FORM_ENV_NAME_PLACEHOLDER,
  SERVER_FORM_ENV_REMOVE_LABEL,
  SERVER_FORM_ENV_VALUE_GOES,
  SERVER_FORM_ENV_VALUE_LABEL,
  SERVER_FORM_MISSING_NOTE,
  SERVER_FORM_ENV_VALUE_NOTE,
} from "../../../../constants";
import type { EnvBlockProps } from "./interfaces";

/**
 * One variable, as its own box. The two halves stand one under the other and each says where it goes —
 * «У ФАЙЛ ПРОЄКТУ» over the name, «ЛИШАЄТЬСЯ ТУТ» over the value — because that is the whole of what a variable
 * is: a pair that travels to two different places. «ПРИБРАТИ» stands in the block's head and belongs to this
 * block, not to the list, so an eye looking at a variable can see how to take it back without any gesture.
 *
 * A variable named with nothing behind it anywhere marks itself: the server will not start at all, and that is a
 * promise of what the launch will do rather than a refusal by the form — «Підключити» is still given.
 */
export function EnvBlock({ name, draft, heldHint, onNameChange, onValueChange, onRemove }: EnvBlockProps) {
  // A value this machine holds stands behind its hint, and the cross is how it is taken off.
  const isHeld = draft === undefined && heldHint !== undefined;
  const hasNothing = name.trim() !== "" && !isHeld && (draft ?? "") === "";

  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: SERVER_FORM_ENV_BLOCK_GAP_PX,
        padding: SERVER_FORM_ENV_BOX_PADDING_PX,
        background: SERVER_FORM_ENV_BOX_BACKGROUND_COLOR,
        border: `1px solid ${SERVER_FORM_ENV_BOX_BORDER_COLOR}`,
        borderRadius: SERVER_FORM_ENV_BOX_RADIUS_PX,
      }}
    >
      <div className="d-flex align-items-center justify-content-between">
        <Mark>{SERVER_FORM_ENV_BLOCK_LABEL}</Mark>
        <TextAction label={SERVER_FORM_ENV_REMOVE_LABEL} isDanger onClick={onRemove} />
      </div>

      <Field
        label={SERVER_FORM_ENV_NAME_LABEL}
        value={name}
        placeholder={SERVER_FORM_ENV_NAME_PLACEHOLDER}
        action={<Mark color={QUIET_MARK_COLOR}>{SERVER_FORM_ENV_NAME_GOES}</Mark>}
        isMono
        isSunken
        onChange={onNameChange}
      />

      <Field
        label={SERVER_FORM_ENV_VALUE_LABEL}
        value={draft ?? ""}
        // The hint stands until somebody types or presses the cross; a variable with nothing says so in its place.
        placeholder={isHeld ? (heldHint ?? "") : SERVER_FORM_MISSING_NOTE}
        note={isHeld ? SERVER_FORM_ENV_VALUE_NOTE : undefined}
        action={<Mark color={QUIET_MARK_COLOR}>{SERVER_FORM_ENV_VALUE_GOES}</Mark>}
        isMono
        isSunken
        isWarned={hasNothing}
        onClear={isHeld ? () => onValueChange("") : undefined}
        onChange={onValueChange}
      />
    </div>
  );
}
