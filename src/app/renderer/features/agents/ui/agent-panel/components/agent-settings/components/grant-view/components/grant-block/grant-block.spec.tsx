import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GrantBlock } from "./grant-block";

describe("GrantBlock", () => {
  it("names the block and stands its rows in a box under that name", () => {
    render(
      <GrantBlock color="#38a3ff" icon={null} label="Закріплені">
        <span>branch = main</span>
      </GrantBlock>,
    );

    expect(screen.getByText("Закріплені")).toBeInTheDocument();
    expect(screen.getByText("branch = main")).toBeInTheDocument();
  });

  it("draws the box dashed where nothing holds what is in it", () => {
    // An open parameter is not held by anything, and the box says so before a word does.
    const { container, rerender } = render(
      <GrantBlock color="#38a3ff" icon={null} label="Закріплені">
        <span>branch</span>
      </GrantBlock>,
    );
    const box = () => container.querySelectorAll("div")[2];

    expect(box()).toHaveProperty("style.borderStyle", "solid");

    rerender(
      <GrantBlock color="#4a5164" icon={null} label="Відкриті" isDashed>
        <span>branch</span>
      </GrantBlock>,
    );

    expect(box()).toHaveProperty("style.borderStyle", "dashed");
  });

  it("carries its own quiet word under the box, where it has one", () => {
    render(
      <GrantBlock color="#4a5164" icon={null} label="Відкриті" note={<span>Модель вирішує їх сама</span>}>
        <span>branch</span>
      </GrantBlock>,
    );

    expect(screen.getByText("Модель вирішує їх сама")).toBeInTheDocument();
  });
});
