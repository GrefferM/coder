import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CanvasOver } from "./canvas-over";
import { UNDO_ACTION_LABEL } from "../undo-line/constants";
import { ZOOM_IN_LABEL } from "../../../../../components/zoom-toolbar/constants";
import type { UndoOffer, WriteNote } from "../../../../project";
import type { CanvasOverProps } from "./interfaces";

const offer: UndoOffer = {
  id: "offer-1",
  deletionId: "deletion-1",
  taken: {
    models: [],
    prompts: [],
    commands: [],
    servers: [],
    agents: [],
    links: [],
    promptTakenFrom: [],
    grantsTakenFrom: [],
  },
  message: "ВИДАЛЕНО АГЕНТА",
  place: null,
  secondsLeft: 30,
};

function props(patch: Partial<CanvasOverProps> = {}): CanvasOverProps {
  return {
    tally: null,
    scale: 0.7,
    undoOffers: [],
    writeNote: null,
    onZoomOut: () => {},
    onZoomIn: () => {},
    onWriteRetry: async () => {},
    onWriteDismiss: () => {},
    onUndo: () => {},
    ...patch,
  };
}

describe("CanvasOver", () => {
  it("always stands the scale, whatever else there is to say", () => {
    render(<CanvasOver {...props()} />);

    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: ZOOM_IN_LABEL,
      }),
    ).toBeInTheDocument();
  });

  it("counts the selected sphere's lines, and says nothing where nothing is selected", () => {
    const { rerender } = render(<CanvasOver {...props()} />);

    expect(screen.queryByText(/вихідн/u)).not.toBeInTheDocument();

    rerender(
      <CanvasOver
        {...props({
          tally: {
            outgoing: 2,
            incoming: 0,
            color: "#6fd3d8",
          },
        })}
      />,
    );

    expect(screen.getByText("2 вихідні")).toBeInTheDocument();
  });

  it("counts nothing for a sphere with no lines at all", () => {
    render(
      <CanvasOver
        {...props({
          tally: {
            outgoing: 0,
            incoming: 0,
            color: "#6fd3d8",
          },
        })}
      />,
    );

    expect(screen.queryByText(/вихідн|вхідн/u)).not.toBeInTheDocument();
  });

  it("says the file's own word along the top, and keeps the offers at the bottom while it stands", () => {
    // The two have separate places, so neither waits behind the other.
    const note: WriteNote = {
      label: "Не вдалося записати файл проєкту",
      detail: null,
      reason: null,
      isRefusal: false,
      act: null,
    };
    const { rerender } = render(
      <CanvasOver
        {...props({
          undoOffers: [offer],
        })}
      />,
    );

    expect(screen.getByText(UNDO_ACTION_LABEL)).toBeInTheDocument();

    rerender(
      <CanvasOver
        {...props({
          undoOffers: [offer],
          writeNote: note,
        })}
      />,
    );

    expect(screen.getByText("Не вдалося записати файл проєкту")).toBeInTheDocument();
    expect(screen.getByText(UNDO_ACTION_LABEL)).toBeInTheDocument();
  });
});
