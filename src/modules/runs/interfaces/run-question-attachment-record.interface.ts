export interface RunQuestionAttachmentRecord {
  id: string;
  place: number;
  path: string;
  name: string;
  kind: string;
  text: string;
  /** The paths that went in as base64, as JSON. */
  binaries: string;
}
