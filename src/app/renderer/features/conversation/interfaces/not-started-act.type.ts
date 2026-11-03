/** The one act a card offers: where its cause is fixed, or the consent window over the server the turn waited on. */
export type NotStartedAct = "providers" | "settings" | "prompt" | "grants" | "model" | "consent";

/** The acts that open a place and need nothing from the card. */
export type NotStartedPlace = Exclude<NotStartedAct, "consent">;
