import { app, BrowserWindow, Menu } from "electron";
import {
  APP_ICON_PATH,
  LAUNCH_AT_LOGIN_LABEL,
  PRELOAD_SCRIPT_PATH,
  RENDERER_DEV_SERVER_URL,
  RENDERER_INDEX_PATH,
  SHOW_WIDGET_LABEL,
  WIDGET_HASH,
  WIDGET_HEIGHT,
  WIDGET_WIDTH,
  WINDOW_BACKGROUND_COLOR,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from "../constants";
import { Validate } from "../../utils/dto-validation";
import { ResizeWidgetDto } from "../../modules/widget";
import type { WidgetSettingsService } from "../../modules/widget";
import type { AppWindows } from "./app-windows.service";
import type { StageParts } from "./interfaces";

/**
 * What stands on the screen: the main window and the desktop widget (52a). Coder lives while either is open; with
 * the main window closed the Dock icon goes, and a launch at login opens the widget alone.
 */
export class AppStage {
  private readonly windows: AppWindows;
  private readonly widgetSettings: WidgetSettingsService;
  private readonly onMainFocus: () => void;

  constructor({ windows, widgetSettings, onMainFocus }: StageParts) {
    this.windows = windows;
    this.widgetSettings = widgetSettings;
    this.onMainFocus = onMainFocus;
  }

  /** The widget where this machine shows it, and the main window unless Coder was started at login. */
  async start(): Promise<void> {
    const { isShown } = await this.widgetSettings.settings();

    this.applyMenu(isShown);

    if (isShown) {
      await this.openWidget();
    }

    if (!app.getLoginItemSettings().wasOpenedAtLogin || !isShown) {
      await this.openMain();
    }
  }

  /** Brings the main window up, opening it where it is closed. */
  async openMain(): Promise<void> {
    const held = this.windows.main();

    app.dock?.show();

    if (held !== null) {
      held.show();
      held.focus();

      return;
    }

    await this.createMain();
  }

  /** Takes the widget off the desktop; with no main window left, Coder quits. */
  async hide(): Promise<void> {
    await this.widgetSettings.change({
      isShown: false,
    });
    this.applyMenu(false);
    this.windows.widget()?.close();
  }

  /** The widget's window at the height its state asks, its top edge and width where they stand. */
  @Validate()
  async resize({ height }: ResizeWidgetDto): Promise<void> {
    const window = this.windows.widget();

    if (window === null) {
      return;
    }

    const [width] = window.getSize();

    window.setSize(width, Math.round(height), true);
  }

  /** Puts the widget on the desktop. */
  async show(): Promise<void> {
    await this.widgetSettings.change({
      isShown: true,
    });
    this.applyMenu(true);
    await this.openWidget();
  }

  private async openWidget(): Promise<void> {
    const held = this.windows.widget();

    if (held !== null) {
      held.show();

      return;
    }

    await this.createWidget();
  }

  private async createMain(): Promise<void> {
    const window = new BrowserWindow({
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
      backgroundColor: WINDOW_BACKGROUND_COLOR,
      icon: APP_ICON_PATH,
      titleBarStyle: "hiddenInset",
      webPreferences: {
        preload: PRELOAD_SCRIPT_PATH,
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    this.windows.holdMain(window);
    // Coming back from an editor, a change the file system did not deliver is read now, not at the next save.
    window.on("focus", this.onMainFocus);
    window.on("closed", () => this.mainClosed());

    await this.load(window, "");
  }

  private async createWidget(): Promise<void> {
    const { place } = await this.widgetSettings.settings();
    const window = new BrowserWindow({
      width: WIDGET_WIDTH,
      height: WIDGET_HEIGHT,
      ...place,
      frame: false,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      // See-through, so the widget's rounded card with its shadow is the whole of what is seen.
      transparent: true,
      webPreferences: {
        preload: PRELOAD_SCRIPT_PATH,
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    this.windows.holdWidget(window);
    window.on("moved", () => void this.rememberPlace(window));
    window.on("closed", () => this.windows.holdWidget(null));

    await this.load(window, WIDGET_HASH);
  }

  /** The main window gone: the Dock icon goes with it while the widget stays. */
  private mainClosed(): void {
    this.windows.holdMain(null);

    if (this.windows.widget() !== null) {
      app.dock?.hide();
    }
  }

  private async rememberPlace(window: BrowserWindow): Promise<void> {
    const [x, y] = window.getPosition();

    await this.widgetSettings.change({
      place: {
        x,
        y,
      },
    });
  }

  /** On the Vite dev server under `npm run dev:app` and on the built renderer otherwise. */
  private async load(window: BrowserWindow, hash: string): Promise<void> {
    if (RENDERER_DEV_SERVER_URL !== undefined) {
      await window.loadURL(hash === "" ? RENDERER_DEV_SERVER_URL : `${RENDERER_DEV_SERVER_URL}#${hash}`);

      return;
    }

    await window.loadFile(RENDERER_INDEX_PATH, {
      hash,
    });
  }

  /** The app menu with the widget's two items (52a); the rest is the system's own. */
  private applyMenu(isWidgetShown: boolean): void {
    const menu = Menu.buildFromTemplate([
      {
        role: "appMenu",
        submenu: [
          {
            role: "about",
          },
          {
            type: "separator",
          },
          {
            label: SHOW_WIDGET_LABEL,
            type: "checkbox",
            checked: isWidgetShown,
            click: (item) => void (item.checked ? this.show() : this.hide()),
          },
          {
            label: LAUNCH_AT_LOGIN_LABEL,
            type: "checkbox",
            checked: app.getLoginItemSettings().openAtLogin,
            click: (item) =>
              app.setLoginItemSettings({
                openAtLogin: item.checked,
              }),
          },
          {
            type: "separator",
          },
          {
            role: "hide",
          },
          {
            role: "hideOthers",
          },
          {
            role: "unhide",
          },
          {
            type: "separator",
          },
          {
            role: "quit",
          },
        ],
      },
      {
        role: "editMenu",
      },
      {
        role: "viewMenu",
      },
      {
        role: "windowMenu",
      },
    ]);

    Menu.setApplicationMenu(menu);
  }
}
