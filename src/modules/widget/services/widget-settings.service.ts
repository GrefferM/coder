import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { WIDGET_FILE_NAME } from "../constants";
import type { WidgetPlace, WidgetSettings } from "../interfaces";

/** How this machine keeps the desktop widget, in the clear beside the database. */
export class WidgetSettingsService {
  constructor(private readonly userDataDirectory: string) {}

  /** The settings as written; a file missing or not of its shape reads as a shown widget with nothing chosen. */
  async settings(): Promise<WidgetSettings> {
    const held = await this.readHeld();

    return {
      isShown: held.isShown !== false,
      directory: typeof held.directory === "string" ? held.directory : null,
      place: this.placeOf(held.place),
      chosen: this.chosenOf(held.chosen),
    };
  }

  /** Writes the settings whole, through a temporary file beside them. */
  async save(settings: WidgetSettings): Promise<void> {
    const filePath = path.join(this.userDataDirectory, WIDGET_FILE_NAME);
    const temporaryPath = `${filePath}.tmp`;
    const written: WidgetSettings = {
      isShown: settings.isShown,
      directory: settings.directory,
      place: settings.place,
      chosen: settings.chosen,
    };

    await mkdir(path.dirname(filePath), {
      recursive: true,
    });
    await writeFile(temporaryPath, JSON.stringify(written, null, 2), "utf8");
    await rename(temporaryPath, filePath);
  }

  /** Lays a change over the settings as written. */
  async change(change: Partial<WidgetSettings>): Promise<void> {
    await this.save({
      ...(await this.settings()),
      ...change,
    });
  }

  private placeOf(held: unknown): WidgetPlace | null {
    if (typeof held !== "object" || held === null) {
      return null;
    }

    const { x, y } = <Record<string, unknown>>held;

    if (typeof x !== "number" || typeof y !== "number") {
      return null;
    }

    return {
      x,
      y,
    };
  }

  private chosenOf(held: unknown): Record<string, string> {
    if (typeof held !== "object" || held === null) {
      return {};
    }

    return Object.fromEntries(Object.entries(held).filter(([, agentId]) => typeof agentId === "string"));
  }

  /** The settings file as parsed, or nothing where it is missing or not JSON. */
  private async readHeld(): Promise<Record<string, unknown>> {
    try {
      const parsed: unknown = JSON.parse(await readFile(path.join(this.userDataDirectory, WIDGET_FILE_NAME), "utf8"));

      return typeof parsed === "object" && parsed !== null ? <Record<string, unknown>>parsed : {};
    } catch {
      return {};
    }
  }
}
