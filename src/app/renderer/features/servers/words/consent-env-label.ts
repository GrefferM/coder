import { SERVER_CONSENT_ENV_LABEL, SERVER_FACTS_SEPARATOR } from "../constants";

/** «ЗМІННІ СЕРЕДОВИЩА · 4»: the head of the names a server starts with, counted. */
export function consentEnvLabel(count: number): string {
  return `${SERVER_CONSENT_ENV_LABEL}${SERVER_FACTS_SEPARATOR}${count}`;
}
