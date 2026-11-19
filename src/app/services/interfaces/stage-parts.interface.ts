import type { WidgetSettingsService } from "../../../modules/widget";
import type { AppWindows } from "../app-windows.service";

/** What the stage is built on: the two windows' holder, the widget's settings, and what the main window's focus does. */
export interface StageParts {
  windows: AppWindows;
  widgetSettings: WidgetSettingsService;
  onMainFocus: () => void;
}
