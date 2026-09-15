import { BACK_CHEVRON_SIZE_PX } from "./constants";

/**
 * The way back. The same chevron wherever a step is walked into, and it is what says «you entered here» — where
 * nothing is entered it is not drawn at all, or the screen promises a door that is not there.
 */
export function BackChevron() {
  return (
    <svg
      width={BACK_CHEVRON_SIZE_PX}
      height={BACK_CHEVRON_SIZE_PX}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m14 6-6 6 6 6" />
    </svg>
  );
}
