/** The model the project hears speech with, as a recording needs it: its provider by id and name, and its own name. */
export interface HearingChoice {
  providerId: string;
  providerName: string;
  model: string;
}
