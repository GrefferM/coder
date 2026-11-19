import { Validate } from "../../../utils/dto-validation";
import { WidgetSettingsService } from "../services";
import { SaveWidgetDto } from "../dto";
import type { WidgetSettings } from "../interfaces";

export class WidgetController {
  constructor(private readonly settingsService: WidgetSettingsService) {}

  async settings(): Promise<WidgetSettings> {
    return this.settingsService.settings();
  }

  @Validate()
  async save(payload: SaveWidgetDto): Promise<void> {
    return this.settingsService.save(payload);
  }
}
