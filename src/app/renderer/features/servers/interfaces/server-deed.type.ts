/**
 * The one thing the head of a catalogue row offers, by what the state asks for — fill in what is
 * missing, raise it, or give it a fresh connection. A server that simply stands answering asks for nothing there:
 * what there is to do with a живий process lives on its page, and the head holds states, not processes.
 */
export type ServerDeed = "fill" | "raise" | "raiseAgain" | null;

/**
 * The one action about the **process** on the page's state row. The kind decides the word because it
 * decides the thing — a local server is our process and is raised afresh, a remote one is a connection and is
 * only asked again — and nothing here ever stops a server: «ЗУПИНИТИ» is nowhere.
 */
export type ServerPageDeed = "raise" | "raiseAgain" | "askAgain" | null;
