/** A provider that answered, or did not, to a turn that reached its address. */
export interface ProviderHeard {
  providerId: string;
  isAnswering: boolean;
}
