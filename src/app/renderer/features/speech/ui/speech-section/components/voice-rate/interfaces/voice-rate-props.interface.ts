export interface VoiceRateProps {
  /** How fast the voice reads; `null` reads at its own pace, shown as 1.0. */
  rate: number | null;
  onChange: (rate: number) => void;
}
