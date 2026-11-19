import { app, BrowserWindow, Menu, Tray } from "electron";
import {
  APP_ICON_PATH,
  QUIT_ICON_PATH,
  QUIT_LABEL,
  TRAY_ICON_PATH,
  TRAY_TOOLTIP,
  PRELOAD_SCRIPT_PATH,
  RENDERER_DEV_SERVER_URL,
  RENDERER_INDEX_PATH,
  WIDGET_HASH,
  WIDGET_HEIGHT,
  WIDGET_WIDTH,
  WINDOW_BACKGROUND_COLOR,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from "../constants";
import { Validate } from "../../utils/dto-validation";
import { ResizeWidgetDto } from "../../modules/widget";
import { WIDGET_SETTINGS_CHANGED_CHANNEL } from "../../contracts";
import type { WidgetSettingsService } from "../../modules/widget";
import type { AppWindows } from "./app-windows.service";
import type { StageParts } from "./interfaces";

/**
 * What stands on the screen: the desktop widget (52a) or the main window, in turn, and Coder in the menu bar. Coder
 * lives until it is closed from the menu bar or the app menu; with the main window closed the Dock icon goes.
 */
export class AppStage {
  private readonly windows: AppWindows;
  private readonly widgetSettings: WidgetSettingsService;
  private readonly onMainFocus: () => void;
  /** Coder in the menu bar; with the main window closed there is no Dock icon and no app menu to reach. */
  private tray: Tray | null = null;

  constructor({ windows, widgetSettings, onMainFocus }: StageParts) {
    this.windows = windows;
    this.widgetSettings = widgetSettings;
    this.onMainFocus = onMainFocus;
    // Both windows hold the same project and sphere: a change from either is told to both.
    this.widgetSettings.listen((settings) => {
      this.windows.toMain(WIDGET_SETTINGS_CHANGED_CHANNEL, settings);
      this.windows.toWidget(WIDGET_SETTINGS_CHANGED_CHANNEL, settings);
    });
  }

  /**
   * Coder starts with the widget alone, set to start with the system in the built app; the main window comes from the
   * widget, and the two take turns: the main window up hides the widget, the main window closed brings it back.
   */
  async start(): Promise<void> {
    if (app.isPackaged) {
      app.setLoginItemSettings({
        openAtLogin: true,
      });
    }

    this.applyMenu();
    await this.openWidget();
  }

  /** Brings the main window up, opening it where it is closed, and puts the widget away meanwhile. */
  async openMain(): Promise<void> {
    const held = this.windows.main();

    app.dock?.show();
    this.windows.widget()?.hide();

    if (held !== null) {
      held.show();
      held.focus();

      return;
    }

    await this.createMain();
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

  /** The menu bar's Coder pressed: the widget, the main window going where it stands. */
  private async showWidget(): Promise<void> {
    const main = this.windows.main();

    if (main !== null) {
      main.close();

      return;
    }

    await this.openWidget();
    this.windows.widget()?.focus();
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

  /** The main window gone: the widget comes back, and the Dock icon goes with the main window. */
  private mainClosed(): void {
    this.windows.holdMain(null);
    app.dock?.hide();
    void this.openWidget();
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

  /** The app menu, and the menu bar's Coder: a press shows the widget, its menu holds the way out. */
  private applyMenu(): void {
    this.applyAppMenu();
    this.applyTray();
  }

  private applyTray(): void {
    const tray = new Tray(TRAY_ICON_PATH);
    const menu = Menu.buildFromTemplate([
      {
        label: QUIT_LABEL,
        icon: QUIT_ICON_PATH,
        click: () => app.quit(),
      },
    ]);

    tray.setToolTip(TRAY_TOOLTIP);
    tray.on("click", () => void this.showWidget());
    tray.on("right-click", () => tray.popUpContextMenu(menu));
    this.tray = tray;
  }

  /** The app menu, the system's own. */
  private applyAppMenu(): void {
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
