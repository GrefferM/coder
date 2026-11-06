/** How a recognising provider is reached: its fixed address, or `null` for the one its card holds, and its protocol. */
export interface HearingWay {
  address: string | null;
  protocolPath: string;
}
