import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SoundClip } from "./sound-clip";
import { DROP_CLIP_LABEL, PLAY_CLIP_LABEL, STOP_CLIP_LABEL } from "../../constants";
import { aHeardClip, aSoundPlayer } from "../../../../testing";

describe("SoundClip", () => {
  it("stands with «▶» and its length while another plays", () => {
    render(
      <SoundClip
        track={aHeardClip()}
        player={aSoundPlayer({
          playingId: "clip-2",
          playedMs: 3_000,
        })}
        onDrop={null}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: PLAY_CLIP_LABEL,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("0:07")).toBeInTheDocument();
  });

  it("says how far it is played while it plays, and «■» stops it", async () => {
    const toggle = vi.fn();
    const clip = aHeardClip();

    render(
      <SoundClip
        track={clip}
        player={aSoundPlayer({
          playingId: clip.id,
          playedMs: 3_000,
          toggle,
        })}
        onDrop={null}
      />,
    );

    expect(screen.getByText("0:03 / 0:07")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", {
        name: STOP_CLIP_LABEL,
      }),
    );

    expect(toggle).toHaveBeenCalledWith(clip);
  });

  it("has no × on a question already sent", () => {
    render(<SoundClip track={aHeardClip()} player={aSoundPlayer()} onDrop={null} />);

    expect(
      screen.queryByRole("button", {
        name: DROP_CLIP_LABEL,
      }),
    ).not.toBeInTheDocument();
  });

  it("takes itself off the field on the ×", async () => {
    const onDrop = vi.fn();

    render(<SoundClip track={aHeardClip()} player={aSoundPlayer()} onDrop={onDrop} />);

    await userEvent.click(
      screen.getByRole("button", {
        name: DROP_CLIP_LABEL,
      }),
    );

    expect(onDrop).toHaveBeenCalledTimes(1);
  });
});
