/** What the page's floors of the keyboard reach for — the acts they run, and the one state they read. */
export interface PageKeysHands {
  /** While a link stands chosen the key is the link's, so the sphere's floor is quiet. */
  chosenLinkId: string | null;
  /** ⌫ over a selected sphere: the question is raised, never the deletion itself. */
  requestDeleteAgent: (agentId: string) => void;
  /** ⌘V: the copy in hand is put down where the canvas says, and the write is awaited. */
  putCopy: (put: () => Promise<string | null>) => Promise<void>;
}
