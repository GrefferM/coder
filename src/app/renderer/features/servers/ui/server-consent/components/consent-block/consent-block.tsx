import { Mark } from "../../../../../../components";
import {
  SERVER_CONSENT_BLOCK_GAP_PX,
  SERVER_CONSENT_BLOCK_HEAD_GAP_PX,
  SERVER_CONSENT_LABEL_COLOR,
} from "../../constants";
import type { ConsentBlockProps } from "./interfaces";

/** One block of the consent window: its mark, a quiet word at the far end, and what it names. */
export function ConsentBlock({ label, aside, children }: ConsentBlockProps) {
  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: SERVER_CONSENT_BLOCK_GAP_PX,
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: SERVER_CONSENT_BLOCK_HEAD_GAP_PX,
        }}
      >
        <Mark color={SERVER_CONSENT_LABEL_COLOR} className="flex-fill">
          {label}
        </Mark>
        {aside !== undefined && <Mark>{aside}</Mark>}
      </div>
      {children}
    </div>
  );
}
