import {
  SOUND_WAVE_BAR_GAP_PX,
  SOUND_WAVE_BAR_RADIUS_PX,
  SOUND_WAVE_BAR_WIDTH_PX,
  SOUND_WAVE_LEAST_BAR_PX,
} from "./constants";
import type { SoundWaveProps } from "./interfaces";

/** A recording's loudness as a row of bars; a press in it says how far along it landed. */
export function SoundWave({ peaks, height, played, playedColor, color, isRunning, onPress }: SoundWaveProps) {
  /** The bars' own width, which a press is measured against rather than the wave's box. */
  const barsWidth = peaks.length * (SOUND_WAVE_BAR_WIDTH_PX + SOUND_WAVE_BAR_GAP_PX) - SOUND_WAVE_BAR_GAP_PX;

  return (
    <span
      className={`d-flex align-items-center flex-fill ${isRunning ? "justify-content-end" : ""}`}
      onClick={
        onPress === null
          ? undefined
          : (event) => {
              const left = event.currentTarget.getBoundingClientRect().left;

              onPress(Math.min(1, Math.max(0, (event.clientX - left) / barsWidth)));
            }
      }
      style={{
        gap: SOUND_WAVE_BAR_GAP_PX,
        height,
        minWidth: 0,
        overflow: "hidden",
        cursor: onPress === null ? "default" : "pointer",
      }}
    >
      {peaks.map((peak, bar) => (
        <span
          key={bar}
          className="flex-shrink-0"
          style={{
            width: SOUND_WAVE_BAR_WIDTH_PX,
            height: Math.max(SOUND_WAVE_LEAST_BAR_PX, Math.round(peak * height)),
            borderRadius: SOUND_WAVE_BAR_RADIUS_PX,
            background: bar < played ? playedColor : color,
          }}
        />
      ))}
    </span>
  );
}
