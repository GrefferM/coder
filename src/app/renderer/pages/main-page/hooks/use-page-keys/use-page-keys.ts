import { isSomethingOpen, isStepStanding, useWindowKeydown } from "../../../../hooks";
import { isTypedIn } from "../../../../utils/keyboard";
import { selectedText } from "../../../../utils/text";
import type { PageKeysHands, PageSubjects } from "../../interfaces";
import type { PageParts } from "../use-page-parts/interfaces";

/** The page's keyboard floors, each quiet while something above it stands. */
export function usePageKeys(subjects: PageSubjects, parts: PageParts, hands: PageKeysHands): void {
  const { chosenLinkId, requestDeleteAgent, putCopy } = hands;

  const { actions, agents, clipboard, models, commands, prompts, wayOut } = subjects;
  // Whatever stands over the canvas answers Escape itself.
  const isSomethingStanding =
    wayOut.isHeld ||
    agents.doomedAgentId !== null ||
    parts.stream.doomedRun !== null ||
    commands.armedCommand !== null ||
    models.armedModelId !== null ||
    prompts.armedPrompt !== null ||
    prompts.editedPromptId !== null;

  /**
   * Third floor: Escape puts the panel away, asking about a draft first; quiet while the projection is open, since it
   * answers Escape itself.
   */
  useWindowKeydown(!isSomethingStanding && !parts.rail.isCollapsed && !parts.pass.isOpen, (event) => {
    // A list open in the panel, or a standing step, is the floor above and answers first.
    if (event.key === "Escape" && !isSomethingOpen() && !isStepStanding()) {
      event.preventDefault();
      parts.rail.handleCollapsedChange(true);
    }
  });

  /** ⌫ or Delete on the selected sphere; quiet while a link is chosen, since that key is the link's. */
  useWindowKeydown(agents.selectedAgentId !== null && chosenLinkId === null, (event) => {
    if (
      (event.key === "Backspace" || event.key === "Delete") &&
      agents.selectedAgentId !== null &&
      !isTypedIn(event.target)
    ) {
      event.preventDefault();
      requestDeleteAgent(agents.selectedAgentId);
    }
  });

  // ⌘Z answers the newest offer, the bottom row.
  useWindowKeydown(actions.undoOffers.length > 0, (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "z" && !isTypedIn(event.target)) {
      event.preventDefault();
      void actions.undoDelete();
    }
  });

  /** ⌘C takes the selected sphere; ⌘V puts its copy on the first free place beside the original. */
  useWindowKeydown(true, (event) => {
    if (!(event.metaKey || event.ctrlKey) || isTypedIn(event.target)) {
      return;
    }

    // ⌘C over selected text belongs to the text.
    if (event.key === "c" && agents.selectedAgentId !== null && selectedText() === "") {
      event.preventDefault();
      clipboard.copy(agents.selectedAgentId);

      return;
    }

    if (event.key === "v" && clipboard.isPasteOffered) {
      event.preventDefault();
      wayOut.guard(() => void putCopy(() => clipboard.pasteBesideSource()));
    }
  });
}
