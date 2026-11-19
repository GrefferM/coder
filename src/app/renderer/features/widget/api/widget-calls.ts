import {
  OPEN_MAIN_WINDOW_CHANNEL,
  PEEK_PROJECT_CHANNEL,
  RESIZE_WIDGET_CHANNEL,
  SAVE_WIDGET_CHANNEL,
  WIDGET_SETTINGS_CHANNEL,
} from "../../../../../contracts";
import type { WidgetSettings } from "../../../../../contracts";
import type { ProjectConfig } from "../../../interfaces";

/** How this machine keeps the widget. */
export async function readWidget(): Promise<WidgetSettings> {
  return window.electronApi.invoke(WIDGET_SETTINGS_CHANNEL);
}

/** Lays a change over how this machine keeps the widget; what it leaves out stands as written. */
export async function changeWidget(change: Partial<WidgetSettings>): Promise<void> {
  await window.electronApi.invoke(SAVE_WIDGET_CHANNEL, change);
}

/** The widget's project as its folder holds it, read without watching; one the widget opens now is remembered. */
export async function peekProject(directory: string, isOpened: boolean): Promise<ProjectConfig> {
  return window.electronApi.invoke(PEEK_PROJECT_CHANNEL, {
    directory,
    isOpened,
  });
}

/** Brings the main window up; the widget goes away meanwhile. */
export async function openMainWindow(): Promise<void> {
  await window.electronApi.invoke(OPEN_MAIN_WINDOW_CHANNEL);
}

/** Asks the widget's window for the height its state needs; its top edge stays. */
export async function resizeWidget(height: number): Promise<void> {
  await window.electronApi.invoke(RESIZE_WIDGET_CHANNEL, {
    height,
  });
}
