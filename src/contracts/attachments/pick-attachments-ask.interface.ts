/**
 * What a pick is counted against: the characters still free under the ceiling of the agent the chat is aimed at.
 * A pick whose fewest characters would be more is refused as soon as the count crosses it — a gigabyte folder is
 * not walked to the end to learn what its first thousand paths already said. None where no model can be asked yet.
 */
export interface PickAttachmentsAsk {
  room: number | null;
}
