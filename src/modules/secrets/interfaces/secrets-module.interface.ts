import type { SecretController } from "../controllers";
import type { SecretService } from "../services";

/** What `createSecretsModule` returns: the module's wired controller, and the service other modules write through. */
export interface SecretsModule {
  controller: SecretController;
  service: SecretService;
}
