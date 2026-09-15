import type { LiveCall } from "../../../interfaces";

/** A turn's calls in the order they went out; a call is said twice, the second word replacing the first. */
export function standingCalls(standing: LiveCall[], said: LiveCall): LiveCall[] {
  const at = standing.findIndex((one) => one.id === said.id);

  if (at === -1) {
    return [...standing, said];
  }

  return standing.map((one, index) => (index === at ? said : one));
}
