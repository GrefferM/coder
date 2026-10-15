import type { ProviderController } from "../controllers";
import type { ProviderService } from "../services";

/** The service is for main-process callers only. */
export interface ProvidersModule {
  controller: ProviderController;
  service: ProviderService;
}
