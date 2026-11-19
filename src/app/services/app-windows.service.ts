import type { BrowserWindow } from "electron";

/** The app's two windows by what they are: the main one and the desktop widget, each `null` while it is not open. */
export class AppWindows {
  private mainWindow: BrowserWindow | null = null;
  private widgetWindow: BrowserWindow | null = null;

  main(): BrowserWindow | null {
    return this.mainWindow;
  }

  widget(): BrowserWindow | null {
    return this.widgetWindow;
  }

  holdMain(window: BrowserWindow | null): void {
    this.mainWindow = window;
  }

  holdWidget(window: BrowserWindow | null): void {
    this.widgetWindow = window;
  }

  /** Sends to the main window; dropped while it is not open. */
  toMain(channel: string, payload: unknown): void {
    this.mainWindow?.webContents.send(channel, payload);
  }

  /** Sends to the widget; dropped while it is not open. */
  toWidget(channel: string, payload: unknown): void {
    this.widgetWindow?.webContents.send(channel, payload);
  }
}
