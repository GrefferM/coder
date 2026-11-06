/** The address with the protocol's path on its end, once, whatever trailing slashes it was written with. */
export function atProtocol(address: string | null, protocolPath: string): string {
  const machine = (address ?? "").replace(/\/+$/, "");

  return machine.endsWith(protocolPath) ? machine : `${machine}${protocolPath}`;
}
