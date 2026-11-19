import {
  FRESH_WIDGET_WALK_CHANNEL,
  HIDE_WIDGET_CHANNEL,
  OPEN_MAIN_WINDOW_CHANNEL,
  PEEK_PROJECT_CHANNEL,
  PUT_WIDGET_WALK_CHANNEL,
  RESIZE_WIDGET_CHANNEL,
  SAVE_WIDGET_CHANNEL,
  STOP_WIDGET_WALK_CHANNEL,
  WIDGET_SETTINGS_CHANNEL,
  WIDGET_WALKS_CHANNEL,
} from "../../../../../contracts";
import type { PutWalkAnswer, WidgetAsk, WidgetSettings, WidgetWalk } from "../../../../../contracts";
import type { ProjectConfig } from "../../../interfaces";

/** How this machine keeps the widget. */
export async function readWidget(): Promise<WidgetSettings> {
  return window.electronApi.invoke(WIDGET_SETTINGS_CHANNEL);
}

/** Writes how this machine keeps the widget, whole. */
export async function saveWidget(settings: WidgetSettings): Promise<void> {
  await window.electronApi.invoke(SAVE_WIDGET_CHANNEL, settings);
}

/** The widget's project as its folder holds it, read without watching; remembered among the recent ones. */
export async function peekProject(directory: string): Promise<ProjectConfig> {
  return window.electronApi.invoke(PEEK_PROJECT_CHANNEL, {
    directory,
  });
}

/** Brings the main window up. */
export async function openMainWindow(): Promise<void> {
  await window.electronApi.invoke(OPEN_MAIN_WINDOW_CHANNEL);
}

/** Takes the widget off the desktop. */
export async function hideWidget(): Promise<void> {
  await window.electronApi.invoke(HIDE_WIDGET_CHANNEL);
}

/** Every sphere's conversation in the widget's project. */
export async function widgetWalks(directory: string): Promise<WidgetWalk[]> {
  return window.electronApi.invoke(WIDGET_WALKS_CHANNEL, {
    directory,
  });
}

/** Puts a question to a sphere; `null` where it did not go. */
export async function putWidgetWalk(ask: WidgetAsk): Promise<PutWalkAnswer | null> {
  return window.electronApi.invoke(PUT_WIDGET_WALK_CHANNEL, ask);
}

export async function stopWidgetWalk(agentId: string): Promise<void> {
  await window.electronApi.invoke(STOP_WIDGET_WALK_CHANNEL, {
    agentId,
  });
}

export async function freshWidgetWalk(agentId: string): Promise<void> {
  await window.electronApi.invoke(FRESH_WIDGET_WALK_CHANNEL, {
    agentId,
  });
}

/** Asks the widget's window for the height its state needs; its top edge stays. */
export async function resizeWidget(height: number): Promise<void> {
  await window.electronApi.invoke(RESIZE_WIDGET_CHANNEL, {
    height,
  });
}
