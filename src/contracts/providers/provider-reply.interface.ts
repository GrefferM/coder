import type { ProviderInstalledModel } from "./provider-installed-model.interface";

export interface ProviderReply {
  isAnswering: boolean;
  models: ProviderInstalledModel[];
}
