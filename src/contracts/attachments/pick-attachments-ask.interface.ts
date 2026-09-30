/**
 * What a pick is counted against: the characters still free under the ceiling of the targeted agent. A pick is refused
 * once its minimum count exceeds that; `null` where no model can be asked yet.
 */
export interface PickAttachmentsAsk {
  room: number | null;
}
