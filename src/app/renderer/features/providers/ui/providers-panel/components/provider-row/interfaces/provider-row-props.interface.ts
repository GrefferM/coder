export interface ProviderRowProps {
  name: string;
  facts: string;
  isFilled: boolean;
  isSilent: boolean;
  onOpen: () => void;
}
