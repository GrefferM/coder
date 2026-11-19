import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { WIDGET_FILE_NAME } from "../constants";
import type { WidgetSettings } from "../interfaces";

/** How this machine keeps the desktop widget, in the clear beside the database. */
export class WidgetSettingsService {
  /** The last change under way; every change waits for the one before, so none is laid over a copy it outdated. */
  private changing: Promise<void> = Promise.resolve();

  /** Who is told the settings after each change. */
  private readonly listeners: ((settings: WidgetSettings) => void)[] = [];

  constructor(private readonly userDataDirectory: string) {}

  /** Tells `listener` the settings as they stand after every change. */
  listen(listener: (settings: WidgetSettings) => void): void {
    this.listeners.push(listener);
  }

  /** The settings as written; a file missing, or a field not of its shape, reads as nothing chosen. */
  async settings(): Promise<WidgetSettings> {
    const held = await this.readHeld();

    return {
      directory: typeof held.directory === "string" ? held.directory : null,
      chosen: this.chosenOf(held.chosen),
      isSilent: held.isSilent === true,
    };
  }

  /** Writes the settings whole, through a temporary file beside them; changes go through `change`. */
  private async save(settings: WidgetSettings): Promise<void> {
    const filePath = path.join(this.userDataDirectory, WIDGET_FILE_NAME);
    const temporaryPath = `${filePath}.tmp`;
    const written: WidgetSettings = {
      directory: settings.directory,
      chosen: settings.chosen,
      isSilent: settings.isSilent,
    };

    await mkdir(path.dirname(filePath), {
      recursive: true,
    });
    await writeFile(temporaryPath, JSON.stringify(written, null, 2), "utf8");
    await rename(temporaryPath, filePath);
  }

  /** Lays a change over the settings as written, after every change before it has landed. */
  async change(change: Partial<WidgetSettings>): Promise<void> {
    const landing = this.changing.then(async () => {
      await this.save({
        ...(await this.settings()),
        ...change,
      });
    });

    this.changing = landing.catch(() => undefined);

    await landing;

    const settings = await this.settings();

    this.listeners.forEach((listener) => listener(settings));
  }

  private chosenOf(held: unknown): Record<string, string> {
    if (typeof held !== "object" || held === null) {
      return {};
    }

    return Object.fromEntries(Object.entries(held).filter(([, agentId]) => typeof agentId === "string"));
  }

  /** The settings file as parsed; nothing where none was ever written. A file that cannot be read says why. */
  private async readHeld(): Promise<Record<string, unknown>> {
    const filePath = path.join(this.userDataDirectory, WIDGET_FILE_NAME);

    if (!existsSync(filePath)) {
      return {};
    }

    const parsed: unknown = JSON.parse(await readFile(filePath, "utf8"));

    return typeof parsed === "object" && parsed !== null ? <Record<string, unknown>>parsed : {};
  }
}
