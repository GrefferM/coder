import { WidgetController } from "./controllers";
import { WidgetSettingsService } from "./services";
import type { WidgetModule } from "./interfaces";

export function createWidgetModule(userDataDirectory: string): WidgetModule {
  const settings = new WidgetSettingsService(userDataDirectory);
  const controller = new WidgetController(settings);

  return {
    controller,
    settings,
  };
}
