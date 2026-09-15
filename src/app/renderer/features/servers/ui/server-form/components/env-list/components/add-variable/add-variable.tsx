import { Mark } from "../../../../../../../../components";
import { useInteraction } from "../../../../../../../../hooks";
import { INTERACTION_ACCENT_COLOR, INTERACTION_TRANSITION } from "../../../../../../../../constants";
import { focusRing } from "../../../../../../../../utils/focus";
import {
  SERVER_FORM_ENV_ADD_BORDER_COLOR,
  SERVER_FORM_ENV_ADD_GAP_PX,
  SERVER_FORM_ENV_ADD_GLYPH_PX,
  SERVER_FORM_ENV_ADD_LABEL,
  SERVER_FORM_ENV_ADD_PADDING_PX,
  SERVER_FORM_ENV_ADD_RADIUS_PX,
} from "../../../../constants";

/**
 * The dashed row under the last block. It is two things at once — the way to add a variable, and the
 * visible edge of the list, so a list of six blocks says where it ends without a rule of its own.
 */
export function AddVariable({ onAdd }: { onAdd: () => void }) {
  const { isLit, isFocused, handlers } = useInteraction();

  return (
    <button
      type="button"
      onClick={onAdd}
      {...handlers}
      className="d-flex align-items-center justify-content-center"
      style={{
        gap: SERVER_FORM_ENV_ADD_GAP_PX,
        padding: `${SERVER_FORM_ENV_ADD_PADDING_PX}px 0`,
        background: "transparent",
        border: `1px dashed ${isLit ? INTERACTION_ACCENT_COLOR : SERVER_FORM_ENV_ADD_BORDER_COLOR}`,
        borderRadius: SERVER_FORM_ENV_ADD_RADIUS_PX,
        outline: "none",
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
        cursor: "pointer",
      }}
    >
      <svg
        width={SERVER_FORM_ENV_ADD_GLYPH_PX}
        height={SERVER_FORM_ENV_ADD_GLYPH_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke={INTERACTION_ACCENT_COLOR}
        strokeWidth={2}
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      <Mark color={INTERACTION_ACCENT_COLOR}>{SERVER_FORM_ENV_ADD_LABEL}</Mark>
    </button>
  );
}
