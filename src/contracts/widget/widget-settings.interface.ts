/** The desktop widget as this machine keeps it; never in a project. */
export interface WidgetSettings {
  /** The widget's project, by its folder; `null` while none is open in it. */
  directory: string | null;
  /** The sphere each project's walks begin at, by agent id, keyed by the project's folder. */
  chosen: Record<string, string>;
}
