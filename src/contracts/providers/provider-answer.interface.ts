import type { ProviderInstalledModel } from "./provider-installed-model.interface";

/** What a local provider answered last time, and when. */
export interface ProviderAnswer {
  isAnswering: boolean;
  /** The last list it gave; a later silence does not empty it. */
  models: ProviderInstalledModel[];
  askedAt: Date;
}
