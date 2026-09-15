import type { ServerFormValues } from "../../../interfaces";

/** A server declared or changed, and a server taken away with its grants and its secrets. */
export interface ServerWrites {
  /** Hands back the server's id: a new one is only named here, and its secrets are held by that name alone. */
  saveServer: (serverId: string | null, values: ServerFormValues) => Promise<string>;
  deleteServer: (serverId: string) => Promise<void>;
}
