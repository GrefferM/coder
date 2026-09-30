import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AimRow } from "./aim-row";
import { AIM_PICKER_NAME_COLOR, AIM_PICKER_OFF_COLOR, AIM_PICKER_ROW_AIMED_COLOR } from "../../constants";
import type { Agent } from "../../../../../../interfaces";
import { anAgent } from "../../../../../../testing";

function agent(patch: Partial<Agent> = {}): Agent {
  return anAgent({
    x: 0,
    y: 0,
    ...patch,
  });
}

function acts() {
  return {
    walkedRow: () => {},
    onChoose: vi.fn(),
    onWalk: vi.fn(),
  };
}

describe("AimRow", () => {
  it("names the agent as ordinary words, the colour belonging to the dot", () => {
    // The name is not painted in the agent's colour; the dot carries it.
    render(<AimRow agent={agent()} isAimed={false} isWalked={false} {...acts()} />);

    expect(screen.getByText("Шукач")).toHaveStyle({
      color: AIM_PICKER_NAME_COLOR,
    });
  });

  it("marks the aimed one by a ring around its dot, and not by a tick", () => {
    const { container } = render(<AimRow agent={agent()} isAimed isWalked={false} {...acts()} />);
    const dot = container.querySelector<HTMLElement>('[style*="border-radius: 50%"]');

    expect(dot?.style.boxShadow).not.toBe("");
    expect(screen.getByText("Шукач")).toHaveStyle({
      color: AIM_PICKER_ROW_AIMED_COLOR,
    });
    expect(screen.queryByText("✓")).not.toBeInTheDocument();
  });

  it("stands an off agent quieter, and still lets it be aimed at", async () => {
    const said = acts();

    render(
      <AimRow
        agent={agent({
          isActive: false,
        })}
        isAimed={false}
        isWalked={false}
        {...said}
      />,
    );

    expect(screen.getByText("Шукач")).toHaveStyle({
      color: AIM_PICKER_OFF_COLOR,
    });

    await userEvent.click(screen.getByRole("button"));

    expect(said.onChoose).toHaveBeenCalledOnce();
  });

  it("takes the walk with the pointer, so the keyboard and the pointer never disagree", async () => {
    const said = acts();

    render(<AimRow agent={agent()} isAimed={false} isWalked={false} {...said} />);
    await userEvent.hover(screen.getByRole("button"));

    expect(said.onWalk).toHaveBeenCalled();
  });
});
