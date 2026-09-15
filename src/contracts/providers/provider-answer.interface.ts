import type { ProviderInstalledModel } from "./provider-installed-model.interface";

/** What a local provider said the last time it was asked, and when that was. */
export interface ProviderAnswer {
  isAnswering: boolean;
  /** The last list it gave; a later silence does not empty it. */
  models: ProviderInstalledModel[];
  askedAt: Date;
}
