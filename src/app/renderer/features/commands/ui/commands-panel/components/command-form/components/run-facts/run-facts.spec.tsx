import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RunFacts } from "./run-facts";

describe("RunFacts", () => {
  it("says under the fields what a command run actually is — the same three facts for every command", () => {
    // The project's folder, no sandbox, the model paying for the whole output. Words are written out, not imported from
    // the constant.
    render(<RunFacts />);

    expect(screen.getByText("ЩО СТАНЕТЬСЯ, КОЛИ АГЕНТ ЇЇ ПОКЛИЧЕ")).toBeInTheDocument();
    expect(screen.getByText(/[ув] теці проєкту/)).toBeInTheDocument();
    expect(screen.getByText(/[Пп]ісочниц/)).toBeInTheDocument();
    expect(screen.getByText(/увесь вивід/)).toBeInTheDocument();
  });
});
