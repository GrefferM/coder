import { Validate } from "../../../utils/dto-validation";
import { SpeechService } from "../services";
import { HearSpeechDto, SaveSpeechDto } from "../dto";
import type { MacPermission, SpeechSettings } from "../interfaces";

export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  async settings(): Promise<SpeechSettings> {
    return this.speechService.settings();
  }

  @Validate()
  async save(payload: SaveSpeechDto): Promise<void> {
    return this.speechService.save(payload);
  }

  @Validate()
  async hear(payload: HearSpeechDto): Promise<string> {
    return this.speechService.hear(payload);
  }

  async macPermission(): Promise<MacPermission> {
    return this.speechService.macPermission();
  }

  async allowMac(): Promise<MacPermission> {
    return this.speechService.allowMac();
  }

  async macLocales(): Promise<string[]> {
    return this.speechService.macLocales();
  }
}
