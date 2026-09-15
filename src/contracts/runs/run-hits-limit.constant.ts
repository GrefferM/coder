/**
 * How many found places travel at most. Every place is a row of its own, and a record where the same sentence
 * stands in every step would answer a single letter with thousands.
 *
 * It stands on the boundary because both sides need the number: the record cuts by it, and the screen knows by it
 * that what it holds is a ceiling and not a count.
 */
export const RUN_HITS_LIMIT = 300;
