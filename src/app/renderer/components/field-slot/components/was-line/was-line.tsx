import { QuietLine } from "../quiet-line";
import { FIELD_SLOT_WAS_PREFIX } from "../../constants";
import type { WasLineProps } from "./interfaces";

/** «БУЛО · …» under a draft-changed field: the value a save would replace. */
export function WasLine({ value }: WasLineProps) {
  return <QuietLine>{`${FIELD_SLOT_WAS_PREFIX}${value}`}</QuietLine>;
}
