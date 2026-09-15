/**
 * A press on the arc of mini-spheres, as the panel hears it. It is an object rather than a name because
 * every press is its own event: pressing the same mini-sphere twice must open the list twice and light the head
 * twice, and two equal names would have looked like nothing happening.
 */
export interface ToolsPress {
  /** The source the mini-sphere stood for, or `null` for the grey «+N» — it is the rest, and no source at all. */
  group: string | null;
  /**
   * The grant behind the mark, by its own id, where the mark stood for one — a command wears a mark of its own.
   * A server's mark names its server in the group and no single grant; the grey rest names nothing.
   */
  grantId: string | null;
}
