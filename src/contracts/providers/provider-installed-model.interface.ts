/** A model a local provider reports as installed: its name and, if given, its size on disk. */
export interface ProviderInstalledModel {
  name: string;
  sizeBytes: number | null;
}
