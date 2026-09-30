import type { ProviderController } from "../controllers";
import type { ProviderService } from "../services";

/** What `createProvidersModule` returns; the service is for main-process callers only. */
export interface ProvidersModule {
  controller: ProviderController;
  service: ProviderService;
}
