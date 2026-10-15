import { Validate } from "../../../utils/dto-validation";
import { ProviderService } from "../services";
import { AskProviderDto, SaveProviderAddressDto, SaveProviderKeyDto } from "../dto";
import type { ProviderReply, ProviderState } from "../interfaces";

export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  async list(): Promise<ProviderState[]> {
    return this.providerService.list();
  }

  @Validate()
  async ask(payload: AskProviderDto): Promise<ProviderReply> {
    return this.providerService.ask(payload);
  }

  @Validate()
  async saveKey(payload: SaveProviderKeyDto): Promise<void> {
    return this.providerService.saveKey(payload);
  }

  @Validate()
  async saveAddress(payload: SaveProviderAddressDto): Promise<void> {
    return this.providerService.saveAddress(payload);
  }
}
