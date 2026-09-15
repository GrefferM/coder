import { ProviderController } from "./controllers";
import { ProviderService } from "./services";
import type { ProviderKeyStore, ProvidersModule } from "./interfaces";

export function createProvidersModule(keys: ProviderKeyStore, userDataDirectory: string): ProvidersModule {
  const providerService = new ProviderService(keys, userDataDirectory);
  const providerController = new ProviderController(providerService);

  return {
    controller: providerController,
    service: providerService,
  };
}
