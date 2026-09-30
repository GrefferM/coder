import { useState } from "react";

import { useWindowKeydown } from "../../../../hooks";
import { isTypedIn } from "../../../../utils/keyboard";
import type { ChosenLinkState } from "./interfaces";

/**
 * The link the person has picked, held by the canvas. While it is chosen ⌫ belongs to the link, not the selected agent;
 * ignored while typing in a field.
 */
export function useChosenLink(
  onChosenChange: (linkId: string | null) => void,
  onDelete: (linkId: string) => void,
): ChosenLinkState {
  const [chosenLinkId, setChosenLinkId] = useState<string | null>(null);

  function choose(linkId: string | null) {
    setChosenLinkId(linkId);
    onChosenChange(linkId);
  }

  useWindowKeydown(chosenLinkId !== null, (event) => {
    if (event.key === "Escape") {
      choose(null);
    }

    if ((event.key === "Backspace" || event.key === "Delete") && chosenLinkId !== null && !isTypedIn(event.target)) {
      event.preventDefault();
      onDelete(chosenLinkId);
      choose(null);
    }
  });

  return {
    chosenLinkId,
    choose,
  };
}
