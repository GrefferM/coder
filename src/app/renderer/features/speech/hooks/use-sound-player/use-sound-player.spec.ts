import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSoundPlayer } from "./use-sound-player";
import { RECORDING_SOUND_CHANNEL } from "../../../../../../contracts";
import { aHeardClip, standInBridge } from "../../../../testing";

/** A sound element that plays at once and keeps every one made. */
class StandInSound {
  static made: StandInSound[] = [];
  currentTime = 0;
  isPlaying = false;
  onended: (() => void) | null = null;

  constructor(readonly src: string) {
    StandInSound.made.push(this);
  }

  async play(): Promise<void> {
    this.isPlaying = true;
  }

  pause(): void {
    this.isPlaying = false;
  }
}

describe("useSoundPlayer", () => {
  beforeEach(() => {
    StandInSound.made = [];
    vi.stubGlobal("Audio", StandInSound);
    URL.createObjectURL = vi.fn(() => "blob:clip");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("plays a recording still on this screen, and silences the reading as it begins", async () => {
    const onPlay = vi.fn();
    const { result } = renderHook(() =>
      useSoundPlayer({
        onPlay,
      }),
    );

    await act(async () => result.current.toggle(aHeardClip()));

    expect(result.current.playingId).toBe("clip-1");
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(StandInSound.made[0].isPlaying).toBe(true);
  });

  it("reads a recording from the record by its own id", async () => {
    const invoke = vi.fn(async () => new Uint8Array([4, 5]));

    standInBridge({
      invoke,
    });

    const { result } = renderHook(() =>
      useSoundPlayer({
        onPlay: vi.fn(),
      }),
    );

    await act(async () =>
      result.current.toggle({
        ...aHeardClip({
          id: "recording-9",
        }),
        audio: null,
      }),
    );

    expect(invoke).toHaveBeenCalledWith(RECORDING_SOUND_CHANNEL, {
      id: "recording-9",
    });
    expect(result.current.playingId).toBe("recording-9");
  });

  it("plays nothing where the record holds no sound under the id", async () => {
    standInBridge({
      invoke: vi.fn(async () => null),
    });

    const { result } = renderHook(() =>
      useSoundPlayer({
        onPlay: vi.fn(),
      }),
    );

    await act(async () =>
      result.current.toggle({
        ...aHeardClip(),
        audio: null,
      }),
    );

    expect(result.current.playingId).toBeNull();
    expect(StandInSound.made).toEqual([]);
  });

  it("stops on the second press, and a new recording stops the old", async () => {
    const { result } = renderHook(() =>
      useSoundPlayer({
        onPlay: vi.fn(),
      }),
    );

    await act(async () => result.current.toggle(aHeardClip()));
    await act(async () =>
      result.current.toggle(
        aHeardClip({
          id: "clip-2",
        }),
      ),
    );

    expect(StandInSound.made[0].isPlaying).toBe(false);
    expect(result.current.playingId).toBe("clip-2");

    await act(async () =>
      result.current.toggle(
        aHeardClip({
          id: "clip-2",
        }),
      ),
    );

    expect(result.current.playingId).toBeNull();
  });

  it("plays from where the wave was pressed, and moves there while it plays", async () => {
    const clip = aHeardClip();
    const { result } = renderHook(() =>
      useSoundPlayer({
        onPlay: vi.fn(),
      }),
    );

    await act(async () => result.current.seek(clip, 0.5));

    const [sound] = StandInSound.made;

    expect(sound.currentTime).toBe(3.5);

    act(() => result.current.seek(clip, 0.25));

    expect(sound.currentTime).toBe(1.75);
    expect(StandInSound.made).toHaveLength(1);
  });

  it("lets go of the mark when the recording ends by itself", async () => {
    const { result } = renderHook(() =>
      useSoundPlayer({
        onPlay: vi.fn(),
      }),
    );

    await act(async () => result.current.toggle(aHeardClip()));
    act(() => StandInSound.made[0].onended?.());

    await waitFor(() => expect(result.current.playingId).toBeNull());
  });
});
