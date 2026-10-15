import type { ProviderState } from "../../../contracts";

export interface ProviderLister {
  list(): Promise<ProviderState[]>;
}
