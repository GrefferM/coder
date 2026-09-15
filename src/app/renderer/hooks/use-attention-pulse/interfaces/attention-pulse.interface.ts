/** Pulse state and its trigger. */
export interface AttentionPulse {
  isStruck: boolean;
  strike: () => void;
}
