import type { RecordedSound } from "../../../../../contracts";

/** A recording made on this screen, under the field until its question goes; found by its own id. */
export interface HeardClip extends RecordedSound {
  id: string;
}
