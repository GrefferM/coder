import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WaitPill } from "./wait-pill";

describe("WaitPill", () => {
  it("names whom the agent waits for and how many of its suppliers have answered", () => {
    render(
      <WaitPill awaitedNames={["LINTER"]} isAwaitingRepeat={false} answered={1} ofSuppliers={2} color="#6fd3d8" />,
    );

    expect(screen.getByText(/Чекає LINTER · Відповів 1 з 2/i)).toBeInTheDocument();
  });

  it("names every supplier still to answer, so a wait on two never reads as a wait on one", () => {
    render(
      <WaitPill
        awaitedNames={["LINTER", "TESTER"]}
        isAwaitingRepeat={false}
        answered={0}
        ofSuppliers={2}
        color="#6fd3d8"
      />,
    );

    expect(screen.getByText(/Чекає LINTER, TESTER · Відповів 0 з 2/i)).toBeInTheDocument();
  });
  it("names the repeat once the walk under the point broke, since no supplier is on its way", () => {
    render(<WaitPill awaitedNames={[]} isAwaitingRepeat answered={1} ofSuppliers={2} color="#6fd3d8" />);

    // Once the walk broke, the point waits for a hand, not for a supplier.
    expect(screen.getByText(/Чекає повтору · Відповів 1 з 2/i)).toBeInTheDocument();
  });
});
