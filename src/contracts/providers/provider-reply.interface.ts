import type { ProviderInstalledModel } from "./provider-installed-model.interface";

/** What came back from asking a local provider — whether it answered at all, and what it has installed. */
export interface ProviderReply {
  isAnswering: boolean;
  models: ProviderInstalledModel[];
}
