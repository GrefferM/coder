import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GrantTitle } from "./grant-title";

describe("GrantTitle", () => {
  it("names the function and says what it says of itself", () => {
    // The description is the command's own words, the ones the model will read.
    render(<GrantTitle name="open_pr" description="Відкриває pull request у поточній гілці" />);

    expect(screen.getByText("open_pr")).toBeInTheDocument();
    expect(screen.getByText("Відкриває pull request у поточній гілці")).toBeInTheDocument();
  });
});
