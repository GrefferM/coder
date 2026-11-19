import type { WidgetController } from "../controllers";
import type { WidgetSettingsService } from "../services";

export interface WidgetModule {
  controller: WidgetController;
  /** The same settings, for the main process that places the widget's window. */
  settings: WidgetSettingsService;
}
