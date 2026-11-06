/** Every write speech makes to the project file. */
export interface SpeechWrites {
  /** Writes which model the project hears speech with, by its id. */
  chooseListenModel: (modelId: string) => Promise<void>;
}
