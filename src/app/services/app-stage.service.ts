import { app, BrowserWindow, globalShortcut, Menu, screen, Tray } from "electron";
import {
  APP_ICON_PATH,
  LISTEN_SHORTCUT,
  QUIT_ICON_PATH,
  QUIT_LABEL,
  TRAY_ICON_PATH,
  TRAY_TOOLTIP,
  PRELOAD_SCRIPT_PATH,
  RENDERER_DEV_SERVER_URL,
  RENDERER_INDEX_PATH,
  WIDGET_HASH,
  WIDGET_HEIGHT,
  WIDGET_EDGE_PX,
  WIDGET_WIDTH,
  WINDOW_BACKGROUND_COLOR,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from "../constants";
import { Validate } from "../../utils/dto-validation";
import { ResizeWidgetDto } from "../../modules/widget";
import { WIDGET_LISTEN_CHANNEL, WIDGET_SETTINGS_CHANGED_CHANNEL } from "../../contracts";
import type { AppWindows } from "./app-windows.service";
import type { StageParts } from "./interfaces";

/**
 * What stands on the screen: Coder in the menu bar, the widget (52a) as its panel, coming up under it and going at a
 * press elsewhere, and the main window, which puts the widget away while it stands. Coder lives until it is closed from
 * the menu bar or the app menu; with the main window closed the Dock icon goes.
 */
export class AppStage {
  private readonly windows: AppWindows;
  private readonly onMainFocus: () => void;
  /** Coder in the menu bar; with the main window closed there is no Dock icon and no app menu to reach. */
  private tray: Tray | null = null;
  /** Coder is closing: the widget's window may close too, rather than being put away. */
  private isQuitting = false;

  constructor({ windows, widgetSettings, onMainFocus }: StageParts) {
    this.windows = windows;
    this.onMainFocus = onMainFocus;
    // Both windows hold the same project and sphere: a change from either is told to both.
    widgetSettings.listen((settings) => {
      this.windows.toMain(WIDGET_SETTINGS_CHANGED_CHANNEL, settings);
      this.windows.toWidget(WIDGET_SETTINGS_CHANGED_CHANNEL, settings);
    });
  }

  /**
   * Coder starts in the menu bar, its widget made and waiting, set to start with the system in the built app; the
   * widget comes up at a press on the menu bar's Coder or at the shortcut, and the main window from the widget.
   */
  async start(): Promise<void> {
    if (app.isPackaged) {
      app.setLoginItemSettings({
        openAtLogin: true,
      });
    }

    this.applyMenu();
    app.on("before-quit", () => {
      this.isQuitting = true;
    });
    app.on("will-quit", () => globalShortcut.unregisterAll());
    // From any app, the shortcut brings the widget up and has its microphone begin or end a question.
    globalShortcut.register(LISTEN_SHORTCUT, () => void this.listen());
    await this.createWidget();
  }

  /**
   * The shortcut pressed: the widget comes up under the menu bar's Coder where it is away, and is told the key was
   * pressed — a question begins, or the one being said ends.
   */
  private async listen(): Promise<void> {
    if (this.windows.widget()?.isVisible() !== true) {
      await this.popUp();
    }

    this.windows.toWidget(WIDGET_LISTEN_CHANNEL, null);
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

  /** The menu bar's Coder pressed: the widget comes up under it, or goes where it stands. */
  private async toggleWidget(): Promise<void> {
    if (this.windows.widget()?.isVisible() === true) {
      this.windows.widget()?.hide();

      return;
    }

    await this.popUp();
  }

  /** The widget under the menu bar's Coder, kept within the screen, and in front, as a menu bar's panel stands. */
  private async popUp(): Promise<void> {
    if (this.windows.widget() === null) {
      await this.createWidget();
    }

    const window = this.windows.widget();

    if (window === null || this.tray === null) {
      return;
    }

    const under = this.tray.getBounds();
    const { workArea } = screen.getDisplayMatching(under);
    const [width] = window.getSize();
    const centred = Math.round(under.x + under.width / 2 - width / 2);
    const x = Math.min(
      Math.max(centred, workArea.x + WIDGET_EDGE_PX),
      workArea.x + workArea.width - width - WIDGET_EDGE_PX,
    );

    window.setPosition(x, workArea.y + WIDGET_EDGE_PX);
    window.show();
    window.focus();
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

  /** The widget's window, made hidden; a press elsewhere puts it away, as it does a menu bar's panel. */
  private async createWidget(): Promise<void> {
    const window = new BrowserWindow({
      width: WIDGET_WIDTH,
      height: WIDGET_HEIGHT,
      show: false,
      frame: false,
      resizable: false,
      movable: false,
      maximizable: false,
      minimizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      // See-through, so the widget's rounded card with its shadow is the whole of what is seen.
      transparent: true,
      webPreferences: {
        preload: PRELOAD_SCRIPT_PATH,
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    this.windows.holdWidget(window);
    window.on("blur", () => window.hide());
    window.on("closed", () => this.windows.holdWidget(null));
    // ⌘W puts it away rather than closing it; only quitting closes it.
    window.on("close", (event) => {
      if (!this.isQuitting) {
        event.preventDefault();
        window.hide();
      }
    });

    await this.load(window, WIDGET_HASH);
  }

  /** The main window gone: the Dock icon goes with it, and the widget comes up under the menu bar's Coder. */
  private mainClosed(): void {
    this.windows.holdMain(null);
    app.dock?.hide();
    void this.popUp();
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
    tray.on("click", () => void this.toggleWidget());
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
