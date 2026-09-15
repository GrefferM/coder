import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FoundWords } from "./found-words";
import { FOUND_WORDS_BACKGROUND_COLOR } from "./constants";

describe("FoundWords", () => {
  it("lights exactly what was typed, and inside a word too", () => {
    // «сесії» is caught on «сесі» — the search is over words, not over whole ones.
    render(<FoundWords words="Перевір сесії користувачів" looked="сесі" />);

    expect(screen.getByText("сесі")).toHaveStyle({
      background: FOUND_WORDS_BACKGROUND_COLOR,
    });
  });

  it("cares nothing for the case it was typed in, and lights the words as they stand", () => {
    render(<FoundWords words="Перевір Сесії" looked="сесі" />);

    expect(screen.getByText("Сесі")).toBeInTheDocument();
  });

  it("lights every place the word stands in, and not the first alone", () => {
    render(<FoundWords words="кеш і ще кеш" looked="кеш" />);

    expect(screen.getAllByText("кеш")).toHaveLength(2);
  });

  it("lights nothing at all while nobody is looking for anything", () => {
    const { container } = render(<FoundWords words="Розбий текст на тези" looked="" />);

    expect(container.querySelector("span")).toBeNull();
    expect(container.textContent).toBe("Розбий текст на тези");
  });

  it("leaves the words whole where the search word is not in them", () => {
    const { container } = render(<FoundWords words="Розбий текст на тези" looked="ялина" />);

    expect(container.querySelector("span")).toBeNull();
  });
});
