import { useState } from "react";

import { useWindowKeydown } from "../../../../hooks";
import { isTypedIn } from "../../../../utils/keyboard";
import type { ChosenLinkState } from "./interfaces";

/**
 * The link the person has picked. No panel opens for a link, so the canvas holds it, and the page is
 * told: while a link is chosen ⌫ belongs to the link and the selected agent's own stands down, the chat keeping a
 * sphere selected all the while. ⌫ is ignored while a field is being typed in.
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
