import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StreamSearch } from "./stream-search";
import { foundOfLabel } from "../../words";
import {
  STREAM_SEARCH_CLEAR_LABEL,
  STREAM_SEARCH_STEP_NEXT_LABEL,
  STREAM_SEARCH_STEP_PREVIOUS_LABEL,
} from "./constants";
import type { StreamSearchProps } from "./interfaces";

function props(patch: Partial<StreamSearchProps> = {}): StreamSearchProps {
  return {
    query: "",
    isTyping: false,
    at: 0,
    found: 0,
    onQuery: vi.fn(),
    onOpen: vi.fn(),
    onClose: vi.fn(),
    onNext: vi.fn(),
    onPrevious: vi.fn(),
    ...patch,
  };
}

describe("StreamSearch", () => {
  it("says which match the stream stands on and how many it holds, since Enter walks between them", () => {
    render(
      <StreamSearch
        {...props({
          query: "кеш",
          at: 2,
          found: 8,
        })}
      />,
    );

    expect(screen.getByText(foundOfLabel(2, 8))).toBeInTheDocument();
  });

  it("says «0 З 0» where the word is in nothing: an open field has to say something", () => {
    render(
      <StreamSearch
        {...props({
          query: "ялина",
        })}
      />,
    );

    expect(screen.getByText(foundOfLabel(0, 0))).toBeInTheDocument();
  });

  it("hands the word back on every letter, the stream riding as the hand types", async () => {
    const onQuery = vi.fn();
    const user = userEvent.setup();

    render(
      <StreamSearch
        {...props({
          onQuery,
        })}
      />,
    );

    await user.type(screen.getByRole("textbox"), "к");

    expect(onQuery).toHaveBeenCalledWith("к");
  });

  it("walks forward on Enter and back on ⇧Enter", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();

    render(
      <StreamSearch
        {...props({
          query: "кеш",
          found: 8,
          onNext,
          onPrevious,
        })}
      />,
    );

    fireEvent.keyDown(screen.getByRole("textbox"), {
      key: "Enter",
    });
    fireEvent.keyDown(screen.getByRole("textbox"), {
      key: "Enter",
      shiftKey: true,
    });

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape, the stream staying where it drove to", () => {
    const onClose = vi.fn();

    render(
      <StreamSearch
        {...props({
          query: "кеш",
          onClose,
        })}
      />,
    );

    fireEvent.keyDown(screen.getByRole("textbox"), {
      key: "Escape",
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("takes the caret when the hand asked for the search, and leaves it alone when a word merely came over", () => {
    const { unmount } = render(
      <StreamSearch
        {...props({
          query: "кеш",
        })}
      />,
    );

    // Arriving from a pressed row leaves the field filled and the caret out of it.
    expect(screen.getByRole("textbox")).not.toHaveFocus();
    unmount();

    render(
      <StreamSearch
        {...props({
          query: "кеш",
          isTyping: true,
        })}
      />,
    );

    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("asks for the caret on ⌘F and lets the press go no further", () => {
    const onOpen = vi.fn();

    render(
      <StreamSearch
        {...props({
          onOpen,
        })}
      />,
    );

    const press = new KeyboardEvent("keydown", {
      key: "f",
      metaKey: true,
      cancelable: true,
    });

    window.dispatchEvent(press);

    // ⌘F belongs to this field and does not reach the field of the question below.
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(press.defaultPrevented).toBe(true);
  });

  it("takes the up arrow for the next match, the freshest standing at the bottom of the stream", async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();

    render(
      <StreamSearch
        {...props({
          query: "кеш",
          found: 8,
          onNext,
        })}
      />,
    );

    // «1» is the newest thing said and stands lowest, so the next match — 2, 3, 4 — is up the screen.
    await user.click(screen.getByLabelText(STREAM_SEARCH_STEP_NEXT_LABEL));

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("walks with the arrows too, the same walk Enter takes offered to a hand", async () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();
    const user = userEvent.setup();

    render(
      <StreamSearch
        {...props({
          query: "кеш",
          found: 8,
          onNext,
          onPrevious,
        })}
      />,
    );

    await user.click(screen.getByLabelText(STREAM_SEARCH_STEP_NEXT_LABEL));
    await user.click(screen.getByLabelText(STREAM_SEARCH_STEP_PREVIOUS_LABEL));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it("dims the arrows to unpressable where there is nowhere to walk", () => {
    render(
      <StreamSearch
        {...props({
          query: "ялина",
          found: 0,
        })}
      />,
    );

    expect(screen.getByLabelText(STREAM_SEARCH_STEP_NEXT_LABEL)).toBeDisabled();
    expect(screen.getByLabelText(STREAM_SEARCH_STEP_PREVIOUS_LABEL)).toBeDisabled();
  });

  it("offers a cross only while there is a word to take out", () => {
    const { unmount } = render(<StreamSearch {...props()} />);

    expect(screen.queryByLabelText(STREAM_SEARCH_CLEAR_LABEL)).not.toBeInTheDocument();
    unmount();

    render(
      <StreamSearch
        {...props({
          query: "кеш",
        })}
      />,
    );

    expect(screen.getByLabelText(STREAM_SEARCH_CLEAR_LABEL)).toBeInTheDocument();
  });

  it("takes the word out by that cross, the same act Escape does", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <StreamSearch
        {...props({
          query: "кеш",
          onClose,
        })}
      />,
    );

    await user.click(screen.getByLabelText(STREAM_SEARCH_CLEAR_LABEL));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
