import {
  SPHERE_TRAIL_COLOR,
  SPHERE_TRAIL_FONT_SIZE_PX,
  SPHERE_TRAIL_GAP_PX,
  SPHERE_TRAIL_GLYPH_PX,
  SPHERE_TRAIL_KEY_PATHS,
  SPHERE_TRAIL_KEY_RING,
  SPHERE_TRAIL_PAIR_GAP_PX,
  SPHERE_TRAIL_PROMPT_PATHS,
  SPHERE_TRAIL_STROKE,
  SPHERE_TRAIL_TOP_PX,
} from "./constants";
import type { SphereTrailProps } from "./interfaces";

/**
 * The trail: a dim third line under the model showing what the agent is made of, a prompt and a key. The key carries
 * the functions granted across all sources, a command counting as one; zero draws no key.
 */
export function SphereTrail({ hasPrompt, tools }: SphereTrailProps) {
  if (!hasPrompt && tools === 0) {
    return null;
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center font-monospace"
      style={{
        marginTop: SPHERE_TRAIL_TOP_PX,
        gap: SPHERE_TRAIL_PAIR_GAP_PX,
        color: SPHERE_TRAIL_COLOR,
        fontSize: SPHERE_TRAIL_FONT_SIZE_PX,
      }}
    >
      {hasPrompt && (
        <svg
          width={SPHERE_TRAIL_GLYPH_PX}
          height={SPHERE_TRAIL_GLYPH_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={SPHERE_TRAIL_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {SPHERE_TRAIL_PROMPT_PATHS.map((drawn) => (
            <path key={drawn} d={drawn} />
          ))}
        </svg>
      )}

      {tools > 0 && (
        <span
          className="d-flex align-items-center"
          style={{
            gap: SPHERE_TRAIL_GAP_PX,
          }}
        >
          <svg
            width={SPHERE_TRAIL_GLYPH_PX}
            height={SPHERE_TRAIL_GLYPH_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={SPHERE_TRAIL_STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle {...SPHERE_TRAIL_KEY_RING} />
            {SPHERE_TRAIL_KEY_PATHS.map((drawn) => (
              <path key={drawn} d={drawn} />
            ))}
          </svg>
          {tools}
        </span>
      )}
    </div>
  );
}
