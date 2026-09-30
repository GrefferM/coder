import { useEffect, useState } from "react";
import { useProjectView } from "../../../../features/project";
import type { CanvasPlace } from "../../../../features/canvas";
import type { PageParts } from "../use-page-parts/interfaces";

/**
 * This machine's note about the project: where the canvas stands, which section is open, whom the chat is aimed at, how
 * tall the field was pulled. Not part of the project file.
 */
export function useNotedView(directory: string, parts: PageParts): (place: CanvasPlace) => void {
  const [place, setPlace] = useState<CanvasPlace | null>(null);
  const rememberView = useProjectView(directory);
  const { activeSectionId, isCollapsed } = parts.rail;
  const { aimedAgentId, fieldHeight } = parts.chat;

  useEffect(() => {
    // Nothing is noted until the canvas reports where it stands.
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
