/** Who hears speech, as a recording needs it: a provider by id and name and its model, or macOS and its language. */
export interface HearingChoice {
  providerId: string;
  providerName: string;
  model: string;
}
