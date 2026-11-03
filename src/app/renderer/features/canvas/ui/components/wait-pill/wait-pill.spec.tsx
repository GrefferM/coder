import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WaitPill } from "./wait-pill";

describe("WaitPill", () => {
  it("names whom the agent waits for and how many of its suppliers have answered", () => {
    render(
      <WaitPill
        awaitedNames={["LINTER"]}
        isAwaitingRepeat={false}
        answered={1}
        silent={0}
        ofSuppliers={2}
        color="#6fd3d8"
      />,
    );

    expect(screen.getByText(/Чекає LINTER · Відповів 1 з 2/i)).toBeInTheDocument();
  });

  it("names every supplier still to answer, so a wait on two never reads as a wait on one", () => {
    render(
      <WaitPill
        awaitedNames={["LINTER", "TESTER"]}
        isAwaitingRepeat={false}
        answered={0}
        silent={0}
        ofSuppliers={2}
        color="#6fd3d8"
      />,
    );

    expect(screen.getByText(/Чекає LINTER, TESTER · Відповів 0 з 2/i)).toBeInTheDocument();
  });
  it("names the repeat once the walk under the point broke, since no supplier is on its way", () => {
    render(<WaitPill awaitedNames={[]} isAwaitingRepeat answered={1} silent={0} ofSuppliers={2} color="#6fd3d8" />);

    expect(screen.getByText(/Чекає повтору · Відповів 1 з 2/i)).toBeInTheDocument();
  });

  it("counts the suppliers that passed nothing on, only when some did not", () => {
    render(
      <WaitPill
        awaitedNames={["TESTER"]}
        isAwaitingRepeat={false}
        answered={1}
        silent={1}
        ofSuppliers={3}
        color="#6fd3d8"
      />,
    );

    expect(screen.getByText(/Чекає TESTER · Відповів 1 з 3 · Не передав 1/i)).toBeInTheDocument();
  });
});
