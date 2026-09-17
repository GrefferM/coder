import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePageKeys } from "./use-page-keys";
import type { PageSubjects } from "../../interfaces";
import type { PageParts } from "../use-page-parts/interfaces";

/** Only what the floors of the keyboard actually read; everything else on the page is none of their business. */
function pageKeys(
  stands: {
    selectedAgentId?: string | null;
    doomedAgentId?: string | null;
    chosenLinkId?: string | null;
    isPasteOffered?: boolean;
    undoOffers?: number;
    isCollapsed?: boolean;
    isPassOpen?: boolean;
    isHeld?: boolean;
    doomedRun?: unknown;
    editedPromptId?: string | null;
  } = {},
) {
  const copy = vi.fn();
  const pasteBesideSource = vi.fn(async () => "agent-2");
  const undoDelete = vi.fn(async () => undefined);
  const collapse = vi.fn();
  const requestDeleteAgent = vi.fn();
  const putCopy = vi.fn(async () => undefined);
  const subjects = <PageSubjects>(<unknown>{
    agents: {
      selectedAgentId: stands.selectedAgentId ?? null,
      doomedAgentId: stands.doomedAgentId ?? null,
    },
    clipboard: {
      copy,
      pasteBesideSource,
      isPasteOffered: stands.isPasteOffered ?? false,
    },
    models: {
      armedModelId: null,
    },
    commands: {
      armedCommand: null,
    },
    prompts: {
      armedPrompt: null,
      editedPromptId: stands.editedPromptId ?? null,
    },
    actions: {
      undoOffers: Array.from(
        {
          length: stands.undoOffers ?? 0,
        },
        (_, at) => ({
          id: `offer-${at}`,
        }),
      ),
      undoDelete,
    },
    wayOut: {
      isHeld: stands.isHeld ?? false,
      guard: (go: () => void) => go(),
    },
  });
  const parts = <PageParts>(<unknown>{
    rail: {
      isCollapsed: stands.isCollapsed ?? false,
      handleCollapsedChange: collapse,
    },
    pass: {
      isOpen: stands.isPassOpen ?? false,
    },
    stream: {
      doomedRun: stands.doomedRun ?? null,
    },
  });

  renderHook(() =>
    usePageKeys(subjects, parts, {
      chosenLinkId: stands.chosenLinkId ?? null,
      requestDeleteAgent,
      putCopy,
    }),
  );

  return {
    copy,
    undoDelete,
    collapse,
    requestDeleteAgent,
    putCopy,
  };
}

function pressKey(key: string, extra: Partial<KeyboardEventInit> = {}, target: EventTarget = window) {
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
        ...extra,
      }),
    );
  });
}

/** A field the person is typing in, standing in the page while the key is pressed. */
function typedIn() {
  const input = document.createElement("input");

  document.body.append(input);

  return input;
}

describe("usePageKeys · Escape and the panel", () => {
  it("puts the panel away when nothing stands over it", () => {
    const { collapse } = pageKeys();

    pressKey("Escape");

    expect(collapse).toHaveBeenCalledWith(true);
  });

  it("stays quiet while a question stands over the canvas", () => {
    // Whatever stands over the canvas answers Escape itself, and this floor does not answer under it.
    const { collapse } = pageKeys({
      doomedAgentId: "agent-1",
    });

    pressKey("Escape");

    expect(collapse).not.toHaveBeenCalled();
  });

  it("stays quiet while the projection stands over the panel", () => {
    const { collapse } = pageKeys({
      isPassOpen: true,
    });

    pressKey("Escape");

    expect(collapse).not.toHaveBeenCalled();
  });

  it("says nothing about a panel that is already away", () => {
    const { collapse } = pageKeys({
      isCollapsed: true,
    });

    pressKey("Escape");

    expect(collapse).not.toHaveBeenCalled();
  });
});

describe("usePageKeys · the key that deletes a sphere", () => {
  it("asks about the selected sphere on ⌫ and on Delete", () => {
    const { requestDeleteAgent } = pageKeys({
      selectedAgentId: "agent-1",
    });

    pressKey("Backspace");
    pressKey("Delete");

    expect(requestDeleteAgent).toHaveBeenCalledTimes(2);
    expect(requestDeleteAgent).toHaveBeenCalledWith("agent-1");
  });

  it("stays quiet while a link stands chosen, though a sphere is still selected", () => {
    // The key is the link's then. The chat keeps a sphere selected all the while, so
    // without this floor one press would take the link and ask about the agent at once.
    const { requestDeleteAgent } = pageKeys({
      selectedAgentId: "agent-1",
      chosenLinkId: "link-1",
    });

    pressKey("Backspace");

    expect(requestDeleteAgent).not.toHaveBeenCalled();
  });

  it("leaves ⌫ to the field the person is typing in", () => {
    const { requestDeleteAgent } = pageKeys({
      selectedAgentId: "agent-1",
    });

    pressKey("Backspace", {}, typedIn());

    expect(requestDeleteAgent).not.toHaveBeenCalled();
  });

  it("does nothing with no sphere selected", () => {
    const { requestDeleteAgent } = pageKeys();

    pressKey("Backspace");

    expect(requestDeleteAgent).not.toHaveBeenCalled();
  });
});

describe("usePageKeys · ⌘Z, ⌘C and ⌘V", () => {
  it("answers the newest way back on ⌘Z", () => {
    // ⌘Z is the bottom row's; every other row has its own button.
    const { undoDelete } = pageKeys({
      undoOffers: 2,
    });

    pressKey("z", {
      metaKey: true,
    });

    expect(undoDelete).toHaveBeenCalled();
  });

  it("does nothing on ⌘Z with no way back standing", () => {
    const { undoDelete } = pageKeys();

    pressKey("z", {
      metaKey: true,
    });

    expect(undoDelete).not.toHaveBeenCalled();
  });

  it("takes the selected sphere on ⌘C", () => {
    const { copy } = pageKeys({
      selectedAgentId: "agent-1",
    });

    pressKey("c", {
      metaKey: true,
    });

    expect(copy).toHaveBeenCalledWith("agent-1");
  });

  it("leaves ⌘C to the words when words are selected", () => {
    // The sphere is still selected under them; copying text must not quietly take the agent instead.
    const selection = vi.spyOn(window, "getSelection");

    selection.mockReturnValue(<Selection>(<unknown>{
      toString: () => "два рядки тексту",
    }));

    const { copy } = pageKeys({
      selectedAgentId: "agent-1",
    });

    pressKey("c", {
      metaKey: true,
    });

    expect(copy).not.toHaveBeenCalled();

    selection.mockRestore();
  });

  it("puts the copy down on ⌘V when one is offered, and nothing when none is", () => {
    const offered = pageKeys({
      isPasteOffered: true,
    });

    pressKey("v", {
      metaKey: true,
    });

    expect(offered.putCopy).toHaveBeenCalled();

    const none = pageKeys();

    pressKey("v", {
      metaKey: true,
    });

    expect(none.putCopy).not.toHaveBeenCalled();
  });

  it("takes ⌃C and ⌃V as the same keys, for a hand used to them", () => {
    const { copy } = pageKeys({
      selectedAgentId: "agent-1",
    });

    pressKey("c", {
      ctrlKey: true,
    });

    expect(copy).toHaveBeenCalledWith("agent-1");
  });
});
