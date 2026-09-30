import type { ServerFormValues } from "../../../interfaces";

/** A server declared or changed, and a server removed with its grants and secrets. */
export interface ServerWrites {
  /** Returns the server's id; a new one is named here and its secrets are held by that name. */
  saveServer: (serverId: string | null, values: ServerFormValues) => Promise<string>;
  deleteServer: (serverId: string) => Promise<void>;
}
