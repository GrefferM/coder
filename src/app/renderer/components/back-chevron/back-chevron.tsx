import { BACK_CHEVRON_SIZE_PX } from "./constants";

/** The way back, drawn only where a step was entered. */
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
