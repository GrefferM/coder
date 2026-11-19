/** The desktop widget as this machine keeps it; never in a project. */
export interface WidgetSettings {
  /** The widget stands on the desktop. */
  isShown: boolean;
  /** The widget's project, by its folder; `null` while none is open in it. */
  directory: string | null;
  /** Where the widget was put, its top-left corner on the screen; `null` until it is moved. */
  place: WidgetPlace | null;
  /** The sphere each project's walks begin at, by agent id, keyed by the project's folder. */
  chosen: Record<string, string>;
}

/** The widget's top-left corner on the screen. */
export interface WidgetPlace {
  x: number;
  y: number;
}
