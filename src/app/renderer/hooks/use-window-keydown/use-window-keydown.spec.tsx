import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { useWindowKeydown } from "./use-window-keydown";

function Probe({ isListening, onKeyDown }: { isListening: boolean; onKeyDown: (event: KeyboardEvent) => void }) {
  useWindowKeydown(isListening, onKeyDown);

  return null;
}

describe("useWindowKeydown", () => {
  it("hears a key while listening, and nothing while not", async () => {
    const onKeyDown = vi.fn();
    const { rerender } = render(<Probe isListening onKeyDown={onKeyDown} />);

    await userEvent.keyboard("{Escape}");

    expect(onKeyDown).toHaveBeenCalledOnce();

    rerender(<Probe isListening={false} onKeyDown={onKeyDown} />);
    await userEvent.keyboard("{Escape}");

    expect(onKeyDown).toHaveBeenCalledOnce();
  });

  it("lands the key in the current closure even when the caller passes a fresh arrow", async () => {
    const seen: number[] = [];

    function Caller() {
      const [count, setCount] = useState(0);

      useWindowKeydown(true, () => {
        seen.push(count);
        setCount(count + 1);
      });

      return null;
    }

    render(<Caller />);
    await userEvent.keyboard("{Enter}{Enter}");

    expect(seen).toEqual([0, 1]);
  });
});
