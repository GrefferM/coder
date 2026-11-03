/**
 * The one action a catalogue row's head offers: fill in what is missing, raise it, reconnect afresh one that answers but
 * works for nobody, or stop a local one that stands working. A working remote server offers none there.
 */
export type ServerDeed = "fill" | "raise" | "raiseAgain" | "stop" | null;

/**
 * The one process action on the page's state row. A local server is raised afresh, a remote one only asked again;
 * nothing stops a server.
 */
export type ServerPageDeed = "raise" | "raiseAgain" | "askAgain" | null;
