import { EMPTY_SERVER_FORM_VALUES } from "../constants";
import type { ProjectMcpServer } from "../../../interfaces";
import type { ServerFormValues } from "../interfaces";

/** A declared server as its form holds it, or empty fields for a new one; the other kind's fields are empty. */
export function serverFormValues(server: ProjectMcpServer | null): ServerFormValues {
  if (server === null) {
    return EMPTY_SERVER_FORM_VALUES;
  }

  return {
    name: server.name,
    isLocal: server.isLocal,
    run: server.run,
    address: server.address,
    signIn: server.signIn,
    env: server.env,
  };
}
