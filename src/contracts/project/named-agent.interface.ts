/**
 * An agent as a drawing needs it: id, name, colour. A record keeps it so a read-back conversation can still name an
 * agent the project dropped.
 */
export interface NamedAgent {
  id: string;
  name: string;
  color: string;
}
