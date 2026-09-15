import { useEffect, useState } from "react";
import { useProjectView } from "../../../../features/project";
import type { CanvasPlace } from "../../../../features/canvas";
import type { PageParts } from "../use-page-parts/interfaces";

/**
 * This machine's own note about this project: where the canvas stands, which section of the rail is open, whom
 * the chat is aimed at, and how tall the field was pulled. Nothing of it belongs in the project file — another
 * machine opening the same project keeps its own.
 *
 * Hands back the one way the canvas says it has moved; everything else is read off the parts as they stand.
 */
export function useNotedView(directory: string, parts: PageParts): (place: CanvasPlace) => void {
  const [place, setPlace] = useState<CanvasPlace | null>(null);
  const rememberView = useProjectView(directory);
  const { activeSectionId, isCollapsed } = parts.rail;
  const { aimedAgentId, fieldHeight } = parts.chat;

  useEffect(() => {
    // Nothing is noted until the canvas has said where it stands: a note without a place would move it home.
    if (place === null) {
      return;
    }

    rememberView({
      pan: place.pan,
      scale: place.scale,
      sectionId: activeSectionId,
      isCollapsed,
      aimedAgentId,
      fieldHeight,
    });
  }, [place, rememberView, activeSectionId, isCollapsed, aimedAgentId, fieldHeight]);

  return setPlace;
}
