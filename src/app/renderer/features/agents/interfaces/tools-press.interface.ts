/** A press on the arc of mini-spheres. An object, not a name, so pressing the same one twice is two events. */
export interface ToolsPress {
  /** The source the mini-sphere stood for; `null` for the grey «+N», the rest. */
  group: string | null;
  /** The grant behind the mark, by id; null for a server's mark (names the server) and the grey rest. */
  grantId: string | null;
}
