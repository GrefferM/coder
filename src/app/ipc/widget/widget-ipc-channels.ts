import { ResizeWidgetDto, SaveWidgetDto, WidgetController } from "../../../modules/widget";
import { OfWidgetSphereDto, PutWidgetWalkDto, WidgetWalkController, WidgetWalksDto } from "../../../modules/walks";
import type { IpcChannelMap } from "../register-ipc-channels";
import type { AppStage } from "../../services";
import {
  FRESH_WIDGET_WALK_CHANNEL,
  HIDE_WIDGET_CHANNEL,
  PUT_WIDGET_WALK_CHANNEL,
  RESIZE_WIDGET_CHANNEL,
  STOP_WIDGET_WALK_CHANNEL,
  WIDGET_WALKS_CHANNEL,
  OPEN_MAIN_WINDOW_CHANNEL,
  SAVE_WIDGET_CHANNEL,
  WIDGET_SETTINGS_CHANNEL,
} from "../../../contracts";

/** The widget's settings, kept by the backend. */
export const WIDGET_IPC_CHANNELS: IpcChannelMap<WidgetController> = {
  [WIDGET_SETTINGS_CHANNEL]: (controller) => controller.settings(),
  [SAVE_WIDGET_CHANNEL]: (controller, payload) => controller.save(Object.assign(new SaveWidgetDto(), payload)),
};

/** What the widget asks of the app's windows. */
export const WIDGET_SHELL_IPC_CHANNELS: IpcChannelMap<AppStage> = {
  [OPEN_MAIN_WINDOW_CHANNEL]: (shell) => shell.openMain(),
  [HIDE_WIDGET_CHANNEL]: (shell) => shell.hide(),
  [RESIZE_WIDGET_CHANNEL]: (shell, payload) => shell.resize(Object.assign(new ResizeWidgetDto(), payload)),
};

/** The widget's spheres' conversations. */
export const WIDGET_WALK_IPC_CHANNELS: IpcChannelMap<WidgetWalkController> = {
  [WIDGET_WALKS_CHANNEL]: (controller, payload) => controller.walks(Object.assign(new WidgetWalksDto(), payload)),
  [PUT_WIDGET_WALK_CHANNEL]: (controller, payload) => controller.put(Object.assign(new PutWidgetWalkDto(), payload)),
  [STOP_WIDGET_WALK_CHANNEL]: (controller, payload) => controller.stop(Object.assign(new OfWidgetSphereDto(), payload)),
  [FRESH_WIDGET_WALK_CHANNEL]: (controller, payload) =>
    controller.fresh(Object.assign(new OfWidgetSphereDto(), payload)),
};
