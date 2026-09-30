import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttachGlyph } from "./attach-glyph";

describe("AttachGlyph", () => {
  it("draws a folder and a file with different marks", () => {
    // The two kinds are told apart by glyph alone, so their paths differ.
    const folder = render(<AttachGlyph kind="folder" size={11} color="#838ba6" />);
    const folderPaths = folder.container.querySelectorAll("path").length;

    const file = render(<AttachGlyph kind="file" size={11} color="#838ba6" />);
    const filePaths = file.container.querySelectorAll("path").length;

    expect(folderPaths).toBe(1);
    expect(filePaths).toBe(2);
  });

  it("takes its size and colour from the caller", () => {
    const { container } = render(<AttachGlyph kind="file" size={13} color="#5c6478" />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("width", "13");
    expect(svg).toHaveAttribute("stroke", "#5c6478");
  });
});
