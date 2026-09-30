import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatTabs } from "./chat-tabs";
import {
  CHAT_TABS_FORGET_PREFIX,
  CHAT_TABS_NEWS_LABEL,
  CHAT_TABS_FRESH_LABEL,
  CHAT_TABS_HISTORY_LABEL,
  CHAT_TABS_STREAM_LABEL,
} from "./constants";

describe("ChatTabs", () => {
  it("stands the two faces of the section, and marks the one that is open", () => {
    render(
      <ChatTabs
        isNews={false}
        active="stream"
        runs={2}
        onFresh={() => {}}
        onForgetAll={() => {}}
        onActiveChange={() => {}}
      />,
    );

    expect(screen.getByText(CHAT_TABS_STREAM_LABEL)).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(CHAT_TABS_HISTORY_LABEL)).toHaveAttribute("aria-selected", "false");
  });

  it("offers a fresh chat where the stream is, and nowhere else", () => {
    const onFresh = vi.fn();
    const { rerender } = render(
      <ChatTabs
        isNews={false}
        active="stream"
        runs={2}
        onFresh={onFresh}
        onForgetAll={() => {}}
        onActiveChange={() => {}}
      />,
    );

    fireEvent.click(screen.getByText(CHAT_TABS_FRESH_LABEL));

    expect(onFresh).toHaveBeenCalled();

    rerender(
      <ChatTabs
        isNews={false}
        active="history"
        runs={2}
        onFresh={onFresh}
        onForgetAll={() => {}}
        onActiveChange={() => {}}
      />,
    );

    // Starting over belongs to the stream, not the history.
    expect(screen.queryByText(CHAT_TABS_FRESH_LABEL)).not.toBeInTheDocument();
  });

  it("stands the history's own act where the stream keeps its own, and only over the history", () => {
    const onForgetAll = vi.fn();
    const { rerender } = render(
      <ChatTabs
        isNews={false}
        active="stream"
        runs={2}
        onFresh={() => {}}
        onForgetAll={onForgetAll}
        onActiveChange={() => {}}
      />,
    );

    // One act per tab: the stream starts over, the history is deleted.
    expect(screen.queryByText(`${CHAT_TABS_FORGET_PREFIX}2`)).not.toBeInTheDocument();

    rerender(
      <ChatTabs
        isNews={false}
        active="history"
        runs={2}
        onFresh={() => {}}
        onForgetAll={onForgetAll}
        onActiveChange={() => {}}
      />,
    );

    // The count is in the name; «всі» alone would mislead under a filter.
    fireEvent.click(screen.getByText(`${CHAT_TABS_FORGET_PREFIX}2`));

    expect(onForgetAll).toHaveBeenCalled();
  });

  it("dims the act to unpressable when the history holds nothing, rather than taking its place away", () => {
    const onForgetAll = vi.fn();

    render(
      <ChatTabs
        isNews={false}
        active="history"
        runs={0}
        onFresh={() => {}}
        onForgetAll={onForgetAll}
        onActiveChange={() => {}}
      />,
    );

    const act = screen.getByText(`${CHAT_TABS_FORGET_PREFIX}0`);

    expect(act).toBeDisabled();

    fireEvent.click(act);

    expect(onForgetAll).not.toHaveBeenCalled();
  });

  it("wears the quiet dot of another conversation on the history, and only while it stands closed", () => {
    // The news sign stands on the other list and goes out when that list is opened, not when the cause is fixed.
    const { rerender } = render(
      <ChatTabs isNews active="stream" runs={2} onFresh={() => {}} onForgetAll={() => {}} onActiveChange={() => {}} />,
    );

    expect(screen.getByLabelText(CHAT_TABS_NEWS_LABEL)).toBeInTheDocument();

    rerender(
      <ChatTabs isNews active="history" runs={2} onFresh={() => {}} onForgetAll={() => {}} onActiveChange={() => {}} />,
    );

    expect(screen.queryByLabelText(CHAT_TABS_NEWS_LABEL)).not.toBeInTheDocument();
  });

  it("says nothing when every conversation is quiet", () => {
    render(
      <ChatTabs
        isNews={false}
        active="stream"
        runs={2}
        onFresh={() => {}}
        onForgetAll={() => {}}
        onActiveChange={() => {}}
      />,
    );

    expect(screen.queryByLabelText(CHAT_TABS_NEWS_LABEL)).not.toBeInTheDocument();
  });
});
