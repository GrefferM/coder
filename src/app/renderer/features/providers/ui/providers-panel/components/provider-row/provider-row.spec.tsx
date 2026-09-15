import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProviderRow } from "./provider-row";
import { PROVIDER_ROW_EMPTY_OPACITY, PROVIDER_ROW_OPEN_LABEL } from "./constants";

describe("ProviderRow", () => {
  it("names the provider and what is known of it, and the whole row leads in", async () => {
    // There is no separate way in — the row is the button.
    const onOpen = vi.fn();

    render(<ProviderRow name="OpenRouter" facts="12 моделей" isFilled isSilent={false} onOpen={onOpen} />);

    const row = screen.getByRole("button", {
      name: `${PROVIDER_ROW_OPEN_LABEL} OpenRouter`,
    });

    expect(row).toHaveTextContent("OpenRouter");
    expect(row).toHaveTextContent("12 моделей");

    await userEvent.click(row);

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("stands dimmer while nothing has been put in it", () => {
    const { rerender } = render(
      <ProviderRow name="OpenRouter" facts="ключа немає" isFilled={false} isSilent={false} onOpen={() => {}} />,
    );

    expect(screen.getByRole("button")).toHaveStyle({
      opacity: PROVIDER_ROW_EMPTY_OPACITY,
    });

    rerender(<ProviderRow name="OpenRouter" facts="12 моделей" isFilled isSilent={false} onOpen={() => {}} />);

    expect(screen.getByRole("button")).toHaveStyle({
      opacity: 1,
    });
  });

  it("draws no glow on a provider that has gone silent, filled though it is", () => {
    // The dot is the provider's own life; a silent one is filled but not living.
    const { container } = render(
      <ProviderRow name="OpenRouter" facts="не відповідає" isFilled isSilent onOpen={() => {}} />,
    );

    const dot = container.querySelector<HTMLElement>('[style*="border-radius: 50%"]');

    expect(dot?.style.boxShadow).toBe("");
  });
});
