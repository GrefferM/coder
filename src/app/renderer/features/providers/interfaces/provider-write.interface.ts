import type { ProviderNeed, ProviderState } from "../../../interfaces";

/** One value written for one provider: which value, and what was typed. */
export interface ProviderWrite {
  provider: ProviderState;
  need: ProviderNeed;
  value: string;
}
