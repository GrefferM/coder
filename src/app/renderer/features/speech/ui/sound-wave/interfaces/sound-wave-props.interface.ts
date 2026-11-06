export interface SoundWaveProps {
  /** Each bar's loudness, from 0 to 1, oldest first. */
  peaks: number[];
  /** The height of a full bar, and of the wave. */
  height: number;
  /** How many bars from the left wear the played colour; the rest wear the other. */
  played: number;
  playedColor: string;
  color: string;
  /** Where the bars stand when they overflow: the running wave keeps its newest at the right edge. */
  isRunning: boolean;
  /** A press at a share of the bars; `null` where the wave cannot be pressed. */
  onPress: ((share: number) => void) | null;
}
