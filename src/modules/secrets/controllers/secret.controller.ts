import { Validate } from "../../../utils/dto-validation";
import { SecretService } from "../services";
import { RemoveSecretDto, SetSecretDto } from "../dto";
import type { SecretHint } from "../interfaces";

/** The entry point to this machine's secrets. */
export class SecretController {
  constructor(private readonly secretService: SecretService) {}

  @Validate()
  async set(payload: SetSecretDto): Promise<SecretHint> {
    return this.secretService.set(payload);
  }

  @Validate()
  async remove(payload: RemoveSecretDto): Promise<void> {
    return this.secretService.remove(payload);
  }

  async hints(): Promise<SecretHint[]> {
    return this.secretService.hints();
  }
}
