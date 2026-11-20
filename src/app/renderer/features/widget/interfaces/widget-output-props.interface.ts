import type { Agent } from "../../../interfaces";
import type { ReadAloud, SoundPlayer, SoundTrack } from "../../speech";
import type { WidgetExchange } from "./widget-exchange.interface";

export interface WidgetOutputProps {
  exchanges: WidgetExchange[];
  agents: Agent[];
  /** The window's one voice, which a speaker over each answer reads it with. */
  aloud: ReadAloud;
  /** The recordings each question was said with, by the question's id. */
  tracks: Record<string, SoundTrack[]>;
  /** The window's one player of recordings. */
  player: SoundPlayer;
}
