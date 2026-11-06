import { useInteraction } from "../../../../hooks";
import { INTERACTION_TRANSITION } from "../../../../constants";
import { focusRing } from "../../../../utils/focus";
import { playedBars } from "../../logic";
import { playedClock } from "../../words";
import { DROP_CLIP_LABEL, PLAY_CLIP_LABEL, STOP_CLIP_LABEL } from "../../constants";
import { SoundWave } from "../sound-wave";
import {
  SOUND_CLIP_BACKGROUND_COLOR,
  SOUND_CLIP_BORDER_COLOR,
  SOUND_CLIP_BORDER_RADIUS_PX,
  SOUND_CLIP_DROP_COLOR,
  SOUND_CLIP_DROP_FONT_SIZE_PX,
  SOUND_CLIP_DROP_LIT_COLOR,
  SOUND_CLIP_GAP_PX,
  SOUND_CLIP_PADDING,
  SOUND_CLIP_PLAY_BACKGROUND_COLOR,
  SOUND_CLIP_PLAY_COLOR,
  SOUND_CLIP_PLAY_GLYPH_SIZE_PX,
  SOUND_CLIP_PLAY_SIZE_PX,
  SOUND_CLIP_PLAYED_COLOR,
  SOUND_CLIP_PLAYING_COLOR,
  SOUND_CLIP_TIME_COLOR,
  SOUND_CLIP_TIME_FONT_SIZE_PX,
  SOUND_CLIP_WAVE_COLOR,
  SOUND_CLIP_WAVE_HEIGHT_PX,
} from "./constants";
import type { SoundClipProps } from "./interfaces";

/** One recording: «▶» plays it, the wave lights as it plays and a press in it seeks, «×» takes it off the field. */
export function SoundClip({ track, player, onDrop }: SoundClipProps) {
  const play = useInteraction();
  const drop = useInteraction();
  const isPlaying = player.playingId === track.id;
  const share = isPlaying && track.durationMs > 0 ? player.playedMs / track.durationMs : 0;

  return (
    <span
      className="d-flex align-items-center"
      style={{
        gap: SOUND_CLIP_GAP_PX,
        padding: SOUND_CLIP_PADDING,
        borderRadius: SOUND_CLIP_BORDER_RADIUS_PX,
        background: SOUND_CLIP_BACKGROUND_COLOR,
        border: `1px solid ${SOUND_CLIP_BORDER_COLOR}`,
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        aria-label={isPlaying ? STOP_CLIP_LABEL : PLAY_CLIP_LABEL}
        onClick={() => player.toggle(track)}
        {...play.handlers}
        className="d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: SOUND_CLIP_PLAY_SIZE_PX,
          height: SOUND_CLIP_PLAY_SIZE_PX,
          padding: 0,
          borderRadius: "50%",
          background: SOUND_CLIP_PLAY_BACKGROUND_COLOR,
          border: `1px solid ${SOUND_CLIP_BORDER_COLOR}`,
          color: isPlaying || play.isLit ? SOUND_CLIP_PLAYING_COLOR : SOUND_CLIP_PLAY_COLOR,
          cursor: "pointer",
          outline: "none",
          boxShadow: focusRing(play.isFocused),
          transition: INTERACTION_TRANSITION,
        }}
      >
        <svg
          width={SOUND_CLIP_PLAY_GLYPH_SIZE_PX}
          height={SOUND_CLIP_PLAY_GLYPH_SIZE_PX}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          {isPlaying ? <rect x="6" y="6" width="12" height="12" rx="2" /> : <path d="M7 4.5v15l13-7.5z" />}
        </svg>
      </button>
      <SoundWave
        peaks={track.peaks}
        height={SOUND_CLIP_WAVE_HEIGHT_PX}
        played={playedBars(track.peaks.length, share)}
        playedColor={SOUND_CLIP_PLAYED_COLOR}
        color={SOUND_CLIP_WAVE_COLOR}
        isRunning={false}
        onPress={(at) => player.seek(track, at)}
      />
      <span
        className="font-monospace flex-shrink-0"
        style={{
          fontSize: SOUND_CLIP_TIME_FONT_SIZE_PX,
          color: SOUND_CLIP_TIME_COLOR,
        }}
      >
        {playedClock(isPlaying ? player.playedMs : null, track.durationMs)}
      </span>
      {onDrop !== null && (
        <button
          type="button"
          aria-label={DROP_CLIP_LABEL}
          onClick={onDrop}
          {...drop.handlers}
          className="flex-shrink-0"
          style={{
            padding: 0,
            border: "none",
            background: "transparent",
            fontSize: SOUND_CLIP_DROP_FONT_SIZE_PX,
            lineHeight: 1,
            color: drop.isLit ? SOUND_CLIP_DROP_LIT_COLOR : SOUND_CLIP_DROP_COLOR,
            cursor: "pointer",
            outline: "none",
            boxShadow: focusRing(drop.isFocused),
            transition: INTERACTION_TRANSITION,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}
