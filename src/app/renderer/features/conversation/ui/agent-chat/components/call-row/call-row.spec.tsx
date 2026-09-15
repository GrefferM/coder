import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CallRow } from "./call-row";
import { useOpenCalls } from "../../../../hooks";
import {
  CALL_ROW_ANSWERED_LABEL,
  CALL_ROW_BREATH_CLASS,
  CALL_ROW_SAID_NO_COLOR,
  CALL_ROW_SAID_NO_LABEL,
  CALL_ROW_STATE_COLOR,
  CALL_ROW_CODE_LABEL,
  CALL_ROW_SOURCE_LABEL,
  CALL_ROW_FROM_MODEL_LABEL,
  CALL_ROW_LINE_PREFIX,
  CALL_ROW_PINNED_LABEL,
  CALL_ROW_REFUSED_LABEL,
  CALL_ROW_RUNNING_LABEL,
  CALL_ROW_SAID_LABEL,
} from "./constants";
import { COPY_ACTION_LABEL } from "../../../../../../components/copy-action/constants";
import { RUN_CALL_RAN, RUN_CALL_REFUSED, RUN_CALL_RUNNING, RUN_CALL_SAID_NO } from "../../../../../record";
import type { LiveCall } from "../../../../../../interfaces";

function call(patch: Partial<LiveCall> = {}): LiveCall {
  return {
    id: "call-1",
    name: "find_deep",
    arguments: {
      depth: "2",
      mask: "*.md",
    },
    pinned: ["mask"],
    line: "find . -maxdepth 2 -name '*.md'",
    output: "report.md",
    refusal: "",
    exitCode: 0,
    serverId: null,
    serverName: "",
    isFailed: false,
    state: RUN_CALL_RAN,
    startedAt: 1_000,
    endedAt: 1_400,
    ...patch,
  };
}

/** The same call, but asked of a server — no line, no code, and a source instead. */
function onServer(patch: Partial<LiveCall> = {}): LiveCall {
  return call({
    name: "browser_navigate",
    arguments: {
      url: "https://staging.acme.dev/login",
    },
    pinned: [],
    line: "",
    output: "### Page snapshot",
    exitCode: null,
    serverId: "server-1",
    serverName: "playwright-mcp",
    startedAt: 1_000,
    endedAt: 1_420,
    ...patch,
  });
}

/**
 * The memory of open calls belongs to the chat, so the row is driven through it here too — that is the
 * whole point of the rule: the same call keeps its place when the working card gives way to the finished turn.
 */
function Row({ call: one }: { call: LiveCall }) {
  const openCalls = useOpenCalls();

  return <CallRow call={one} agentColor="#6fd3d8" openCalls={openCalls} />;
}

describe("CallRow · a call asked of a server", () => {
  it("says how long the server took instead of a code it never had", async () => {
    // «коду виходу немає · процесу не було» — and an empty field is not left standing in its place.
    render(<Row call={onServer()} />);

    expect(screen.getByText(`${CALL_ROW_ANSWERED_LABEL}0.42 С`)).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(CALL_ROW_CODE_LABEL))).not.toBeInTheDocument();
  });

  it("says the server refused, and how long it took to say it", async () => {
    // «відмова — це відповідь, вона прийшла, і за який час — такий самий факт».
    render(
      <Row
        call={onServer({
          isFailed: true,
          state: RUN_CALL_SAID_NO,
          output: "browser_click: ref=e17 not found on page",
        })}
      />,
    );

    expect(screen.getByText(`${CALL_ROW_SAID_NO_LABEL} · 0.42 С`)).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(CALL_ROW_ANSWERED_LABEL))).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByText("browser_click: ref=e17 not found on page")).toBeInTheDocument();
  });

  it("colours the words that name a refusal, and leaves the quiet ends grey", () => {
    // The words of this end take the colour and nothing else of the row; only the troubled ends take one.
    const { rerender } = render(
      <Row
        call={onServer({
          isFailed: true,
          state: RUN_CALL_SAID_NO,
        })}
      />,
    );

    expect(screen.getByText(`${CALL_ROW_SAID_NO_LABEL} · 0.42 С`)).toHaveStyle({
      color: CALL_ROW_SAID_NO_COLOR,
    });

    rerender(<Row call={onServer()} />);

    expect(screen.getByText(`${CALL_ROW_ANSWERED_LABEL}0.42 С`)).toHaveStyle({
      color: CALL_ROW_STATE_COLOR,
    });
  });

  it("names the server's answer and offers it whole, and offers nothing of a command's output", async () => {
    // The answer is a block of its own, and «СКОПІЮВАТИ» takes it away whole.
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText,
      },
      configurable: true,
    });

    const { rerender } = render(<Row call={onServer()} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: /browser_navigate/,
      }),
    );

    expect(screen.getByText(CALL_ROW_SAID_LABEL)).toBeInTheDocument();

    await userEvent.click(screen.getByText(COPY_ACTION_LABEL));

    expect(writeText).toHaveBeenCalledWith("### Page snapshot");

    rerender(<Row call={call()} />);

    // A command's output has no head of its own, so nothing is added over it here either.
    expect(screen.queryByText(CALL_ROW_SAID_LABEL)).not.toBeInTheDocument();
  });

  it("marks a server's call round and a command's square, the way the arc marks its own", () => {
    // The mark is the source's shape, and the same shape stands on the sphere's arc.
    const { container, rerender } = render(<Row call={onServer()} />);

    expect(container.querySelector("button > span")).toHaveStyle({
      borderRadius: "50%",
    });

    rerender(<Row call={call()} />);

    expect(container.querySelector("button > span")).not.toHaveStyle({
      borderRadius: "50%",
    });
  });

  it("breathes while the call is out, and stands still the moment it is over", () => {
    // The mark keeps its place and its size — only the light in it comes and goes.
    const { container, rerender } = render(
      <Row
        call={onServer({
          state: RUN_CALL_RUNNING,
        })}
      />,
    );

    expect(container.querySelector(`.${CALL_ROW_BREATH_CLASS}`)).not.toBeNull();

    rerender(<Row call={onServer()} />);

    expect(container.querySelector(`.${CALL_ROW_BREATH_CLASS}`)).toBeNull();
  });

  it("says where the call went, in the block the line would have stood in", async () => {
    render(<Row call={onServer()} />);
    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByText(CALL_ROW_SOURCE_LABEL)).toBeInTheDocument();
    expect(screen.getByText(/playwright-mcp/)).toBeInTheDocument();
  });

  it("leaves a command's call as it was: the code, and no source", async () => {
    render(<Row call={call()} />);
    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByText(`${CALL_ROW_CODE_LABEL}0`)).toBeInTheDocument();
    expect(screen.queryByText(CALL_ROW_SOURCE_LABEL)).not.toBeInTheDocument();
  });
});

describe("CallRow", () => {
  it("names the call and how it ended", () => {
    render(<Row call={call()} />);

    expect(screen.getByText("find_deep")).toBeInTheDocument();
    expect(screen.getByText(`${CALL_ROW_CODE_LABEL}0`)).toBeInTheDocument();
  });

  it("says a call refused at the door has no code at all, rather than showing a zero", () => {
    // A refused call never ran, so there is nothing for a code to mean.
    render(
      <Row
        call={call({
          state: RUN_CALL_REFUSED,
          exitCode: null,
          serverId: null,
          serverName: "",
          isFailed: false,
        })}
      />,
    );

    expect(screen.getByText(CALL_ROW_REFUSED_LABEL)).toBeInTheDocument();
  });

  it("stands folded while the call is out, and says it is running all the same", () => {
    // A call is one line in the stream — a turn of a dozen calls is a dozen lines, not a dozen blocks.
    render(
      <Row
        call={call({
          state: RUN_CALL_RUNNING,
        })}
      />,
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByText(CALL_ROW_RUNNING_LABEL, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("keeps a call the person opened while it was out open once it is over", async () => {
    // The row that draws it changes with the card, and the answer landing is not a reason to close what is being read.
    const { rerender } = render(
      <Row
        call={call({
          state: RUN_CALL_RUNNING,
        })}
      />,
    );

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");

    rerender(<Row call={call()} />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("folds again on a second press, and stays folded when the call is over", async () => {
    const { rerender } = render(
      <Row
        call={call({
          state: RUN_CALL_RUNNING,
        })}
      />,
    );

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");

    rerender(<Row call={call()} />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });

  it("starts folded where the call was never out here, as a line read back from the record", () => {
    render(<Row call={call()} />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });

  it("opens on a press, and shows the line as it ran with the values already in it", async () => {
    render(<Row call={call()} />);
    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(`${CALL_ROW_LINE_PREFIX}find . -maxdepth 2 -name '*.md'`)).toBeInTheDocument();
  });

  it("says of each argument whether the person fixed it or the model decided it", async () => {
    // A pinned argument never reached the model, and the record must not blur the two.
    render(<Row call={call()} />);
    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByText(CALL_ROW_PINNED_LABEL)).toBeInTheDocument();
    expect(screen.getByText(CALL_ROW_FROM_MODEL_LABEL)).toBeInTheDocument();
  });
});
