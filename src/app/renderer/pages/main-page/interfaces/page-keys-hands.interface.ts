/** The acts the page's key handlers run and the one state they read. */
export interface PageKeysHands {
  /** While a link is chosen the key belongs to the link, so the sphere's handler stays quiet. */
  chosenLinkId: string | null;
  /** ⌫ over a selected sphere raises the question, never the deletion itself. */
  requestDeleteAgent: (agentId: string) => void;
  /** ⌘V: puts the held copy down where the canvas says; awaits the write. */
  putCopy: (put: () => Promise<string | null>) => Promise<void>;
}
