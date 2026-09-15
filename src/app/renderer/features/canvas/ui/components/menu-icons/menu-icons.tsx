import { CONTEXT_MENU_ICON_SIZE_PX } from "../../../../../components/context-menu/constants";
import { BROKEN_COLOR, CONTROL_AT_REST_COLOR } from "../../../../../constants";

const ICON_MUTED_COLOR = CONTROL_AT_REST_COLOR;
const ICON_ACCENT_COLOR = "#38a3ff";
const ICON_DANGER_COLOR = BROKEN_COLOR;
const ICON_DISABLED_COLOR = "#3a4258";

/** Add-agent menu item icon. */
export function AddAgentIcon() {
  return (
    <svg
      width={CONTEXT_MENU_ICON_SIZE_PX}
      height={CONTEXT_MENU_ICON_SIZE_PX}
      viewBox="0 0 24 24"
      fill="none"
      stroke={ICON_MUTED_COLOR}
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Paste-agent icon, greyed when there is nothing to paste. */
export function PasteAgentIcon({ isDisabled = false }: { isDisabled?: boolean }) {
  return (
    <svg
      width={CONTEXT_MENU_ICON_SIZE_PX}
      height={CONTEXT_MENU_ICON_SIZE_PX}
      viewBox="0 0 24 24"
      fill="none"
      stroke={isDisabled ? ICON_DISABLED_COLOR : ICON_MUTED_COLOR}
      strokeWidth={1.6}
    >
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
    </svg>
  );
}

/** Add-link icon. */
export function AddLinkIcon() {
  return (
    <svg
      width={CONTEXT_MENU_ICON_SIZE_PX}
      height={CONTEXT_MENU_ICON_SIZE_PX}
      viewBox="0 0 24 24"
      fill="none"
      stroke={ICON_ACCENT_COLOR}
      strokeWidth={1.8}
    >
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="12" r="2.6" />
      <path d="M8.6 12h6.8" strokeLinecap="round" />
    </svg>
  );
}

/** Copy-agent icon. */
export function CopyAgentIcon() {
  return (
    <svg
      width={CONTEXT_MENU_ICON_SIZE_PX}
      height={CONTEXT_MENU_ICON_SIZE_PX}
      viewBox="0 0 24 24"
      fill="none"
      stroke={ICON_MUTED_COLOR}
      strokeWidth={1.6}
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

/** Delete icon; the link pill draws it smaller. */
export function DeleteAgentIcon({ sizePx = CONTEXT_MENU_ICON_SIZE_PX }: { sizePx?: number }) {
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 24 24"
      fill="none"
      stroke={ICON_DANGER_COLOR}
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <path d="M5 7h14M9 7V5h6v2M7 7l1 12h8l1-12" />
    </svg>
  );
}
