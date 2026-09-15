/** Label, `isFilled` for empty sections, `isDashed` for the in-form add-row variant, and the click handler. */
export interface CatalogueActionProps {
  label: string;
  isFilled?: boolean;
  isDashed?: boolean;
  onClick: () => void;
}
