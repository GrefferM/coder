import type { ProviderNeed, ProviderState } from "../../../interfaces";

/** One thing written for one provider: which of the things it asked for, and what was typed. */
export interface ProviderWrite {
  provider: ProviderState;
  need: ProviderNeed;
  value: string;
}
