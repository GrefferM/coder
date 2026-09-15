/** One model a local provider reports as installed: the name it calls it, and its size on disk when it says one. */
export interface ProviderInstalledModel {
  name: string;
  sizeBytes: number | null;
}
