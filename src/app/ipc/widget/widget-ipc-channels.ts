import { ResizeWidgetDto, SaveWidgetDto, WidgetController } from "../../../modules/widget";
import type { IpcChannelMap } from "../register-ipc-channels";
import type { AppStage } from "../../services";
import {
  RESIZE_WIDGET_CHANNEL,
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
  [RESIZE_WIDGET_CHANNEL]: (shell, payload) => shell.resize(Object.assign(new ResizeWidgetDto(), payload)),
};
