import type { SecretController } from "../controllers";
import type { SecretService } from "../services";

export interface SecretsModule {
  controller: SecretController;
  service: SecretService;
}
