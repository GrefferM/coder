import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Composer } from "./composer";
import {
  AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX,
  AGENT_CHAT_NO_AIM_HINT,
  AGENT_CHAT_NO_AIM_PLACEHOLDER,
  AGENT_CHAT_OFF_HINT,
  AGENT_CHAT_OFF_PLACEHOLDER,
  AGENT_CHAT_GRIP_LABEL,
  AGENT_CHAT_ATTACH_CLOSE_LABEL,
  AGENT_CHAT_ATTACH_LABEL,
  AGENT_CHAT_SEND_LABEL,
  AGENT_CHAT_STOP_BLINK_CLASS,
  AGENT_CHAT_STOP_LABEL,
  AGENT_CHAT_WALKING_PLACEHOLDER,
} from "../../constants";
import type { ComposerProps } from "./interfaces";
import type { PickedAttachment } from "../../../../../../interfaces";
import { FIELD_LEAST_HEIGHT_PX, FIELD_MOST_HEIGHT_PX } from "../../../../constants";

const FIELD = `${AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX}Шукач`;

describe("Composer · the field's own height", () => {
  it("stands at its least where nobody ever pulled it", () => {
    render(<Composer {...props()} />);

    expect(screen.getByLabelText(FIELD)).toHaveStyle({
      height: `${FIELD_LEAST_HEIGHT_PX}px`,
    });
  });

  it("stands where the person left it, because the note this machine keeps says so", () => {
    render(
      <Composer
        {...props({
          fieldHeight: 210,
        })}
      />,
    );

    expect(screen.getByLabelText(FIELD)).toHaveStyle({
      height: "210px",
    });
  });

  it("never stands taller than the stream can spare, whatever the note says", () => {
    // Any note text still fits the field.
    render(
      <Composer
        {...props({
          fieldHeight: 5_000,
        })}
      />,
    );

    expect(screen.getByLabelText(FIELD)).toHaveStyle({
      height: `${FIELD_MOST_HEIGHT_PX}px`,
    });
  });

  it("gives the pull a place of its own to be taken by", () => {
    render(<Composer {...props()} />);

    expect(screen.getByLabelText(AGENT_CHAT_GRIP_LABEL)).toBeInTheDocument();
  });
});

function props(patch: Partial<ComposerProps> = {}): ComposerProps {
  return {
    agentId: "agent-1",
    agentName: "Шукач",
    isAgentActive: true,
    isWalking: false,
    draft: "",
    onDraftChange: vi.fn(),
    attachments: [],
    onAttach: vi.fn(),
    onDetach: vi.fn(),
    onSend: vi.fn(),
    onStop: vi.fn(),
    fieldHeight: null,
    onFieldHeight: vi.fn(),
    ...patch,
  };
}

describe("Composer", () => {
  it("names whom the question would go to, and how to send it", () => {
    render(<Composer {...props()} />);

    expect(screen.getByPlaceholderText(`${FIELD}…`)).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: AGENT_CHAT_SEND_LABEL,
      }),
    ).toBeInTheDocument();
  });

  it("stitches the field shut where there is nothing to write in it at all", () => {
    // No target or an inactive agent: nowhere to send.
    const { rerender } = render(
      <Composer
        {...props({
          agentId: null,
        })}
      />,
    );

    expect(screen.getByLabelText(FIELD)).toBeDisabled();
    expect(screen.getByPlaceholderText(AGENT_CHAT_NO_AIM_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.getByText(AGENT_CHAT_NO_AIM_HINT)).toBeInTheDocument();

    rerender(
      <Composer
        {...props({
          isAgentActive: false,
        })}
      />,
    );

    expect(screen.getByLabelText(FIELD)).toBeDisabled();
    expect(screen.getByPlaceholderText(AGENT_CHAT_OFF_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.getByText(AGENT_CHAT_OFF_HINT)).toBeInTheDocument();
  });

  it("stays open while a walk goes, and says why nothing is going", () => {
    // Writing stays open during a walk; only sending waits.
    render(
      <Composer
        {...props({
          isWalking: true,
        })}
      />,
    );

    expect(screen.getByLabelText(FIELD)).toBeEnabled();
    expect(screen.getByPlaceholderText(AGENT_CHAT_WALKING_PLACEHOLDER)).toBeInTheDocument();
  });

  it("puts one hand under the field: the stop while a walk goes, the way to send otherwise", () => {
    const { rerender } = render(<Composer {...props()} />);

    expect(screen.queryByText(AGENT_CHAT_STOP_LABEL)).not.toBeInTheDocument();

    rerender(
      <Composer
        {...props({
          isWalking: true,
        })}
      />,
    );

    expect(screen.getByText(AGENT_CHAT_STOP_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(AGENT_CHAT_ATTACH_LABEL)).not.toBeInTheDocument();
  });

  it("sends on ⌘↵ and leaves a plain Enter to make a new line", async () => {
    const said = props({
      draft: "Знайди md-файли",
    });

    render(<Composer {...said} />);

    const field = screen.getByLabelText(FIELD);

    await userEvent.type(field, "{Enter}");

    expect(said.onSend).not.toHaveBeenCalled();

    await userEvent.type(field, "{Meta>}{Enter}{/Meta}");

    expect(said.onSend).toHaveBeenCalledOnce();
  });

  it("sends nothing where nothing is typed", async () => {
    const said = props({
      draft: "   ",
    });

    render(<Composer {...said} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: AGENT_CHAT_SEND_LABEL,
      }),
    );

    expect(said.onSend).not.toHaveBeenCalled();
  });

  it("answers a press under the walk by blinking the stop, since the stop is what the press wants", async () => {
    // No second question while a walk is out.
    const said = props({
      isWalking: true,
      draft: "Ще одне",
    });

    render(<Composer {...said} />);

    const stop = screen.getByText(AGENT_CHAT_STOP_LABEL).closest("button");

    expect(stop?.className).not.toContain(AGENT_CHAT_STOP_BLINK_CLASS);

    await userEvent.type(screen.getByLabelText(FIELD), "{Meta>}{Enter}{/Meta}");

    expect(said.onSend).not.toHaveBeenCalled();
    expect(screen.getByText(AGENT_CHAT_STOP_LABEL).closest("button")?.className).toContain(AGENT_CHAT_STOP_BLINK_CLASS);
  });

  it("blinks at nothing where nothing was typed, no question having been asked for", async () => {
    const said = props({
      isWalking: true,
      draft: "",
    });

    render(<Composer {...said} />);
    await userEvent.type(screen.getByLabelText(FIELD), "{Meta>}{Enter}{/Meta}");

    expect(screen.getByText(AGENT_CHAT_STOP_LABEL).closest("button")?.className).not.toContain(
      AGENT_CHAT_STOP_BLINK_CLASS,
    );
  });

  it("stops the walk on the stop's own press", async () => {
    const said = props({
      isWalking: true,
    });

    render(<Composer {...said} />);
    await userEvent.click(screen.getByText(AGENT_CHAT_STOP_LABEL));

    expect(said.onStop).toHaveBeenCalledOnce();
  });
});

function attachment(patch: Partial<PickedAttachment> = {}): PickedAttachment {
  return {
    path: "/proj/logout.log",
    name: "logout.log",
    kind: "file",
    bytes: 2150,
    least: 600,
    ...patch,
  };
}

describe("Composer · attaching files", () => {
  it("puts «+ ПРИКРІПИТИ» under the field while it is open, and opens the pick on a press", async () => {
    const said = props();

    render(<Composer {...said} />);
    await userEvent.click(screen.getByText(AGENT_CHAT_ATTACH_LABEL));

    expect(said.onAttach).toHaveBeenCalledOnce();
  });

  it("takes «+ ПРИКРІПИТИ» away where there is nowhere to send — a walk out, or a stitched field", () => {
    const { rerender } = render(
      <Composer
        {...props({
          isWalking: true,
        })}
      />,
    );

    expect(screen.queryByText(AGENT_CHAT_ATTACH_LABEL)).not.toBeInTheDocument();

    rerender(
      <Composer
        {...props({
          agentId: null,
        })}
      />,
    );

    expect(screen.queryByText(AGENT_CHAT_ATTACH_LABEL)).not.toBeInTheDocument();
  });

  it("shows a chip for each attachment, and takes one off by its own path on the ×", async () => {
    const said = props({
      attachments: [
        attachment(),
        attachment({
          path: "/proj/src",
          name: "src",
          kind: "folder",
        }),
      ],
    });

    render(<Composer {...said} />);

    expect(screen.getByText("logout.log")).toBeInTheDocument();
    // A folder wears a trailing slash so the eye sees the tree.
    expect(screen.getByText("src/")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(`${AGENT_CHAT_ATTACH_CLOSE_LABEL} logout.log`));

    expect(said.onDetach).toHaveBeenCalledWith("/proj/logout.log");
  });

  it("draws no chip row while nothing is attached", () => {
    render(<Composer {...props()} />);

    expect(screen.queryByText("logout.log")).not.toBeInTheDocument();
  });
});
