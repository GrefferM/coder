import { LinkCounts } from "../link-counts";
import { UndoStack } from "../undo-stack";
import { WriteNote as WriteNoteLine } from "../write-note";
import { ZoomToolbar } from "../../../../../components";
import type { CanvasOverProps } from "./interfaces";

/** What stands over the field rather than being drawn on it. */
export function CanvasOver({
  tally,
  scale,
  undoOffers,
  writeNote,
  onZoomOut,
  onZoomIn,
  onWriteRetry,
  onWriteDismiss,
  onUndo,
}: CanvasOverProps) {
  return (
    <>
      {tally !== null && tally.outgoing + tally.incoming > 0 && (
        <LinkCounts outgoing={tally.outgoing} incoming={tally.incoming} color={tally.color} />
      )}
      <ZoomToolbar scale={scale} onZoomOut={onZoomOut} onZoomIn={onZoomIn} />
      {/* The app's own note stands along the top, so the offers keep the bottom. */}
      {writeNote !== null && (
        <WriteNoteLine note={writeNote} onRetry={() => void onWriteRetry()} onDismiss={onWriteDismiss} />
      )}
      {undoOffers.length > 0 && <UndoStack offers={undoOffers} onUndo={onUndo} />}
    </>
  );
}
