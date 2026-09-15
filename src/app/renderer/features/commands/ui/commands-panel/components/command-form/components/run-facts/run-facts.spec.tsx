import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RunFacts } from "./run-facts";

describe("RunFacts", () => {
  it("says under the fields what a command run actually is — the same three facts for every command", () => {
    // The project's own folder, no sandbox, and the model paying for the whole output. The words are
    // written out here rather than taken from the constant: a spec that quotes what it checks cannot fail on it,
    // and these three sentences are the point of the block.
    render(<RunFacts />);

    expect(screen.getByText("ЩО СТАНЕТЬСЯ, КОЛИ АГЕНТ ЇЇ ПОКЛИЧЕ")).toBeInTheDocument();
    expect(screen.getByText(/[ув] теці проєкту/)).toBeInTheDocument();
    expect(screen.getByText(/[Пп]ісочниц/)).toBeInTheDocument();
    expect(screen.getByText(/увесь вивід/)).toBeInTheDocument();
  });
});
