import { SecretController } from "./controllers";
import { SecretService } from "./services";
import type { SecretCipher, SecretsModule } from "./interfaces";

export function createSecretsModule(cipher: SecretCipher, userDataDirectory: string): SecretsModule {
  const secretService = new SecretService(cipher, userDataDirectory);
  const secretController = new SecretController(secretService);

  return {
    controller: secretController,
    service: secretService,
  };
}
