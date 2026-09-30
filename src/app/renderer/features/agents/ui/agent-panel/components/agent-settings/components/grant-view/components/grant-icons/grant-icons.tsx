import { GRANT_VIEW_BLOCK_ICON_SIZE_PX } from "../../constants";

/** Pinned parameters: a closed lock. */
export function PinnedIcon({ color }: { color: string }) {
  return (
    <svg
      width={GRANT_VIEW_BLOCK_ICON_SIZE_PX}
      height={GRANT_VIEW_BLOCK_ICON_SIZE_PX}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/** Parameters the model fills in: an open lock. */
export function OpenIcon({ color }: { color: string }) {
  return (
    <svg
      width={GRANT_VIEW_BLOCK_ICON_SIZE_PX}
      height={GRANT_VIEW_BLOCK_ICON_SIZE_PX}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 7.5-1.7" />
    </svg>
  );
}
