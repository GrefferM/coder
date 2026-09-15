import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UnsavedAgentConfirm } from "./unsaved-agent-confirm";

const LONG = "Е".repeat(400);

function ask() {
  render(
    <UnsavedAgentConfirm
      name="Тезар"
      changes={[
        {
          label: "ПРОМПТ",
          droppedLabel: "промпт",
          was: "ТЕЗАР",
          now: LONG,
        },
      ]}
      blocked={[]}
      blockedNote={null}
      ask="leave"
      onSave={vi.fn()}
      onDiscard={vi.fn()}
      onStay={vi.fn()}
    />,
  );
}

describe("UnsavedAgentConfirm", () => {
  it("cuts a value too long for the box, and keeps the whole of it on the pointer", () => {
    ask();

    // The box has one width, and what a person typed gives way inside it.
    const written = screen.getByTitle(LONG);

    expect(written.textContent).toMatch(/^Е+…$/);
    expect(written.textContent!.length).toBeLessThan(LONG.length);
  });

  it("leaves the short value beside it whole", () => {
    ask();

    // A value that needs little takes little: the room it leaves goes to the one that needs it.
    expect(screen.getByTitle("ТЕЗАР")).toHaveTextContent("ТЕЗАР");
  });
});
