/** What `Tab` is handed. */
export interface TabProps {
  label: string;
  isActive: boolean;
  isNews: boolean;
  onSelect: () => void;
}
