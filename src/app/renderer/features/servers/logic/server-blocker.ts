import { SERVER_ADDRESS_DROPPED_LABEL, SERVER_NAME_DROPPED_LABEL, SERVER_RUN_DROPPED_LABEL } from "../constants";
import type { ServerFormValues } from "../interfaces";

/**
 * Required fields still empty, by the names the leave question uses. Only the half the switch points at is asked
 * for: the other one keeps whatever was typed in it, and nothing is owed for a kind this server is not.
 */
export function serverBlocker(values: ServerFormValues): string[] {
  const missing: string[] = [];

  if (!values.name.trim()) {
    missing.push(SERVER_NAME_DROPPED_LABEL);
  }

  if (values.isLocal && !values.run.trim()) {
    missing.push(SERVER_RUN_DROPPED_LABEL);
  }

  if (!values.isLocal && !values.address.trim()) {
    missing.push(SERVER_ADDRESS_DROPPED_LABEL);
  }

  return missing;
}
