import { isSomethingOpen, isStepStanding, useWindowKeydown } from "../../../../hooks";
import { isTypedIn } from "../../../../utils/keyboard";
import { selectedText } from "../../../../utils/text";
import type { PageKeysHands, PageSubjects } from "../../interfaces";
import type { PageParts } from "../use-page-parts/interfaces";

/** The rank: the page's floors of the keyboard, each quiet while something above it stands. */
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
   * The rank, third floor: Escape puts the panel away, a draft in it being asked about first. The projection
   * stands over the panel and answers Escape itself, so this floor is quiet while it is open.
   */
  useWindowKeydown(!isSomethingStanding && !parts.rail.isCollapsed && !parts.pass.isOpen, (event) => {
    // A list open inside the panel, or a standing step, is the floor above and answers the key first.
    if (event.key === "Escape" && !isSomethingOpen() && !isStepStanding()) {
      event.preventDefault();
      parts.rail.handleCollapsedChange(true);
    }
  });

  /**
   * ⌫ or Delete on the selected sphere — ⌫ is the keystroke its menu prints. While a link stands
   * chosen the key is the link's and this floor is quiet, the chat keeping a sphere selected all the while.
   */
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

  // ⌘Z answers the newest offer — the bottom row — and every other row has its own button.
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

    // ⌘C over selected words belongs to the text, not to the sphere.
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
