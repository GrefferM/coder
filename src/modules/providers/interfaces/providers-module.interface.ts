import type { ProviderController } from "../controllers";
import type { ProviderService } from "../services";

/** What `createProvidersModule` returns; the service is exposed for main-process callers alone. */
export interface ProvidersModule {
  controller: ProviderController;
  service: ProviderService;
}
