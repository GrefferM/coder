import type { ProviderState } from "../../../contracts";

/** The providers as they stand now, with what this machine holds for each. */
export interface ProviderLister {
  list(): Promise<ProviderState[]>;
}
