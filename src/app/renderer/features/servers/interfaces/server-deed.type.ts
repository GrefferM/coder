/**
 * The one action a catalogue row's head offers: fill in what is missing, raise it, or reconnect afresh. A server that
 * is answering offers none there.
 */
export type ServerDeed = "fill" | "raise" | "raiseAgain" | null;

/**
 * The one process action on the page's state row. A local server is raised afresh, a remote one only asked again;
 * nothing stops a server.
 */
export type ServerPageDeed = "raise" | "raiseAgain" | "askAgain" | null;
