import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RunGraph } from "./run-graph";
import { RUN_GRAPH_EDGE_WIDTH, RUN_GRAPH_REST_LINE_COLOR } from "./constants";
import { ZOOM_IN_LABEL, ZOOM_OUT_LABEL } from "../../../../../../components/zoom-toolbar/constants";
import { RUN_DONE, RUN_STEP_DONE } from "../../../../../record";
import type { WholeRun, WholeStep } from "../../../../../record";
import { aStep } from "../../../../../../testing";

function step(patch: Partial<WholeStep> = {}): WholeStep {
  return aStep({
    agentName: "EDITOR",
    agentColor: "#b18aff",
    model: "claude-sonnet-4.5",
    providerId: "anthropic",
    contextCeiling: 200_000,
    temperature: 0.3,
    asked: "Додай кешування у fetchUser",
    said: "Готово",
    state: RUN_STEP_DONE,
    startedAt: new Date("2026-08-31T15:41:00"),
    endedAt: new Date("2026-08-31T15:41:12"),
    ...patch,
  });
}

function run(walk: WholeStep[]): WholeRun {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "EDITOR",
    startedByAgentColor: "#b18aff",
    askedAgentId: "agent-1",
    askedAgentName: "EDITOR",
    asked: "Додай кешування у fetchUser і онови тести",
    state: RUN_DONE,
    startedAt: new Date("2026-08-31T15:41:00"),
    askedAt: new Date("2026-08-31T15:41:00"),
    endedAt: new Date("2026-08-31T15:44:06"),
    questions: [
      {
        id: "question-1",
        place: 1,
        asked: "Додай кешування у fetchUser і онови тести",
        askedAt: new Date("2026-08-31T15:41:00"),
        askedAgentId: "agent-1",
        attached: [],
        recordings: [],
      },
    ],
    steps: walk.length,
    money: 0.21,
    worked: 186_000,
    walk,
    memories: [],
  };
}

describe("RunGraph", () => {
  it("stands a sphere for every turn, named by its agent and by how long it took", () => {
    render(<RunGraph run={run([step()])} standings={[]} openStepId={null} onOpen={() => undefined} />);

    expect(screen.getByText("EDITOR")).toBeInTheDocument();
    expect(screen.getByText("12 c")).toBeInTheDocument();
  });

  it("stands the same agent twice when it worked twice — a sphere here is a step, not an agent", () => {
    render(
      <RunGraph
        run={run([
          step(),
          step({
            id: "step-2",
            place: 2,
            fromStepIds: ["step-1"],
            startedAt: new Date("2026-08-31T15:41:12"),
            endedAt: new Date("2026-08-31T15:41:20"),
          }),
        ])}
        standings={[]}
        openStepId={null}
        onOpen={() => undefined}
      />,
    );

    expect(screen.getAllByText("EDITOR")).toHaveLength(2);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("marks the ruler once per turn, counting from the moment the question was asked", () => {
    render(
      <RunGraph
        run={run([
          step(),
          step({
            id: "step-2",
            place: 2,
            fromStepIds: ["step-1"],
            startedAt: new Date("2026-08-31T15:42:16"),
            endedAt: new Date("2026-08-31T15:42:30"),
          }),
        ])}
        standings={[]}
        openStepId={null}
        onOpen={() => undefined}
      />,
    );

    expect(screen.getByText("0:00")).toBeInTheDocument();
    expect(screen.getByText("1:16")).toBeInTheDocument();
  });

  it("draws a transition as a quiet grey line with a head, and no colour until a step is read", () => {
    const { container } = render(
      <RunGraph
        run={run([
          step({
            agentColor: "#e9a3d0",
          }),
          step({
            id: "step-2",
            place: 2,
            agentName: "TESTER",
            fromStepIds: ["step-1"],
            startedAt: new Date("2026-08-31T15:41:12"),
            endedAt: new Date("2026-08-31T15:41:20"),
          }),
        ])}
        standings={[]}
        openStepId={null}
        onOpen={() => undefined}
      />,
    );

    const drawn = container.querySelector("path");

    expect(drawn).toHaveAttribute("stroke", RUN_GRAPH_REST_LINE_COLOR);
    expect(drawn).toHaveAttribute("stroke-width", String(RUN_GRAPH_EDGE_WIDTH));
    expect(drawn).not.toHaveAttribute("stroke-dasharray");
    expect(container.querySelector("polygon")).toHaveAttribute("fill", RUN_GRAPH_REST_LINE_COLOR);
  });

  it("lays every line with right angles alone, and hangs below what a line would go past", () => {
    const { container } = render(
      <RunGraph
        run={run([
          step(),
          step({
            id: "step-2",
            place: 2,
            agentName: "TESTER",
            fromStepIds: ["step-1"],
            startedAt: new Date("2026-08-31T15:41:12"),
            endedAt: new Date("2026-08-31T15:41:20"),
          }),
          step({
            id: "step-3",
            place: 3,
            agentName: "REVIEWER",
            fromStepIds: ["step-1", "step-2"],
            startedAt: new Date("2026-08-31T15:41:20"),
            endedAt: new Date("2026-08-31T15:41:31"),
          }),
        ])}
        standings={[]}
        openStepId={null}
        onOpen={() => undefined}
      />,
    );
    // Spheres are paths too, so the walk's lines are picked by their paint.
    const drawn = [...container.querySelectorAll("path")].filter(
      (line) => line.getAttribute("stroke") === RUN_GRAPH_REST_LINE_COLOR,
    );

    // Three feeds, three runs: the shared head is a point, not a run.
    expect(drawn).toHaveLength(3);
    // The middle turn hangs in its own lane, so its two lines each turn a corner.
    expect(drawn.filter((line) => line.getAttribute("d")?.includes("Q"))).toHaveLength(2);
    // Nothing is drawn on a slant; only corners leave the axes.
    expect(drawn.some((line) => line.getAttribute("d")?.includes("C"))).toBe(false);
  });

  it("gives a turn several lines arrive at one head, not one head over another", () => {
    const { container } = render(
      <RunGraph
        run={run([
          step(),
          step({
            id: "step-2",
            place: 2,
            agentName: "TESTER",
            fromStepIds: ["step-1"],
            startedAt: new Date("2026-08-31T15:41:12"),
            endedAt: new Date("2026-08-31T15:41:20"),
          }),
          step({
            id: "step-3",
            place: 3,
            agentName: "REVIEWER",
            fromStepIds: ["step-1", "step-2"],
            startedAt: new Date("2026-08-31T15:41:20"),
            endedAt: new Date("2026-08-31T15:41:31"),
          }),
        ])}
        standings={[]}
        openStepId={null}
        onOpen={() => undefined}
      />,
    );
    const heads = [...container.querySelectorAll("polygon")];

    // Identical heads at one spot would blot, so the receiver draws one.
    expect(heads).toHaveLength(2);
    expect(new Set(heads.map((head) => head.getAttribute("points")))).toHaveLength(2);
  });

  it("takes the field along with the mouse, and leaves the ruler where it was at the top", () => {
    const { container } = render(
      <RunGraph run={run([step()])} standings={[]} openStepId={null} onOpen={() => undefined} />,
    );
    const field = container.firstChild as HTMLElement;
    const ruler = screen.getByText("0:00");
    const stood = ruler.style.top;

    fireEvent.mouseDown(field, {
      button: 0,
      clientX: 0,
      clientY: 0,
    });
    fireEvent.mouseMove(window, {
      clientX: 60,
      clientY: 40,
    });
    fireEvent.mouseUp(window);

    expect(container.querySelector('[style*="translate(60px, 40px)"]')).toBeInTheDocument();
    expect(ruler.style.left).toBe(`${60 + 150 * 1.2 - 60}px`);
    expect(ruler.style.top).toBe(stood);
  });

  it("opens at the scale a record is read at, and says it in the corner as the canvas does", () => {
    const { container } = render(
      <RunGraph run={run([step()])} standings={[]} openStepId={null} onOpen={() => undefined} />,
    );

    // A pass opens at 120%, no closer.
    expect(screen.getByText("120%")).toBeInTheDocument();
    expect(container.querySelector('[style*="scale(1.2)"]')).toBeInTheDocument();
  });

  it("steps the scale from the corner, by its own ends and not the canvas's", () => {
    const { container } = render(
      <RunGraph run={run([step()])} standings={[]} openStepId={null} onOpen={() => undefined} />,
    );

    fireEvent.click(screen.getByLabelText(ZOOM_OUT_LABEL));

    expect(screen.getByText("110%")).toBeInTheDocument();
    expect(container.querySelector('[style*="scale(1.1)"]')).toBeInTheDocument();
  });

  it("goes closer than the canvas ever does, since the spheres here are drawn small", () => {
    // The projection's scale ends are its own: 150% at the near end, where the canvas stops at 100%.
    render(<RunGraph run={run([step()])} standings={[]} openStepId={null} onOpen={() => undefined} />);

    fireEvent.click(screen.getByLabelText(ZOOM_IN_LABEL));
    fireEvent.click(screen.getByLabelText(ZOOM_IN_LABEL));
    fireEvent.click(screen.getByLabelText(ZOOM_IN_LABEL));
    fireEvent.click(screen.getByLabelText(ZOOM_IN_LABEL));

    expect(screen.getByText("150%")).toBeInTheDocument();
    expect(screen.getByLabelText(ZOOM_IN_LABEL)).toBeDisabled();
  });

  it("walks back off the far end, so the way out is never one way", () => {
    render(<RunGraph run={run([step()])} standings={[]} openStepId={null} onOpen={() => undefined} />);

    // Seven steps down from 120% is the floor: that button is disabled, its neighbour is not.
    for (let step = 0; step < 7; step += 1) {
      fireEvent.click(screen.getByLabelText(ZOOM_OUT_LABEL));
    }

    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByLabelText(ZOOM_OUT_LABEL)).toBeDisabled();

    fireEvent.click(screen.getByLabelText(ZOOM_IN_LABEL));

    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("scales by the wheel, a stop at a notch", () => {
    const { container } = render(
      <RunGraph run={run([step()])} standings={[]} openStepId={null} onOpen={() => undefined} />,
    );
    const field = container.firstChild as HTMLElement;

    fireEvent.wheel(field, {
      deltaY: 1,
    });

    // One wheel notch is one scale stop, as on the canvas.
    expect(container.querySelector('[style*="scale(1.1)"]')).toBeInTheDocument();
  });

  it("gives every turn its own mark on the ruler, since every turn has a column", () => {
    render(
      <RunGraph
        run={run([
          step(),
          step({
            id: "step-2",
            place: 2,
            agentName: "TESTER",
            fromStepIds: ["step-1"],
            startedAt: new Date("2026-08-31T15:41:12"),
            endedAt: new Date("2026-08-31T15:41:20"),
          }),
          step({
            id: "step-3",
            place: 3,
            agentName: "LINTER",
            fromStepIds: ["step-1"],
            startedAt: new Date("2026-08-31T15:41:12"),
            endedAt: new Date("2026-08-31T15:41:21"),
          }),
        ])}
        standings={[]}
        openStepId={null}
        onOpen={() => undefined}
      />,
    );

    // Turns that began together get their own columns, so the same moment is marked twice.
    expect(screen.getAllByText("0:12")).toHaveLength(2);
  });

  it("opens the step whose sphere is pressed, and rings no one until one is open", () => {
    const opened: string[] = [];
    const { container } = render(
      <RunGraph run={run([step()])} standings={[]} openStepId={null} onOpen={(stepId) => opened.push(stepId)} />,
    );

    // Nothing stands open, so nothing is ringed.
    expect(container.querySelector('div.rounded-circle[style*="pointer-events: none"]')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );

    expect(opened).toEqual(["step-1"]);
  });

  it("rings the open turn and keeps the whole field: the sheet stands over the pass, not beside it", () => {
    const { container } = render(
      <RunGraph run={run([step()])} standings={[]} openStepId="step-1" onOpen={() => undefined} />,
    );

    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    // The ring and the ruler marks ignore pointer events.
    expect(container.querySelector('div.rounded-circle[style*="pointer-events: none"]')).toBeInTheDocument();
    // The field gets no width of its own.
    expect(container.querySelector('[style*="width: 520px"]')).not.toBeInTheDocument();
  });
});
