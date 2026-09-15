import { Dot, FieldSlot, Mark } from "../../../../../../../../components";
import {
  SUPPLIERS_COUNT_SEPARATOR,
  SUPPLIERS_LABEL,
  SUPPLIERS_LIST_GAP_PX,
  SUPPLIERS_OF_SEPARATOR,
  SUPPLIER_DOT_SIZE_PX,
  SUPPLIER_LIVE_LABEL,
  SUPPLIER_NAME_COLOR,
  SUPPLIER_NAME_FONT_SIZE_PX,
  SUPPLIER_OFF_DOT_COLOR,
  SUPPLIER_OFF_LABEL,
  SUPPLIER_OFF_NAME_COLOR,
  SUPPLIER_OFF_STATE_COLOR,
  SUPPLIER_ROW_BACKGROUND_COLOR,
  SUPPLIER_ROW_BORDER_COLOR,
  SUPPLIER_ROW_BORDER_RADIUS_PX,
  SUPPLIER_ROW_GAP_PX,
  SUPPLIER_ROW_OFF_BACKGROUND_COLOR,
  SUPPLIER_ROW_OFF_BORDER_COLOR,
  SUPPLIER_ROW_OFF_OPACITY,
  SUPPLIER_ROW_PADDING,
  SUPPLIER_STATE_COLOR,
  SUPPLIER_STATE_LETTER_SPACING_PX,
} from "./constants";
import type { SuppliersListProps } from "./interfaces";

/** Who work can come from; off suppliers stay listed, the counter shows «1 / 2». */
export function SuppliersList({ suppliers }: SuppliersListProps) {
  const live = suppliers.filter((supplier) => supplier.isActive).length;
  const count = live === suppliers.length ? String(live) : `${live}${SUPPLIERS_OF_SEPARATOR}${suppliers.length}`;

  return (
    <FieldSlot label={`${SUPPLIERS_LABEL}${SUPPLIERS_COUNT_SEPARATOR}${count}`}>
      <div
        className="d-flex flex-column"
        style={{
          gap: SUPPLIERS_LIST_GAP_PX,
        }}
      >
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="d-flex align-items-center"
            style={{
              gap: SUPPLIER_ROW_GAP_PX,
              padding: SUPPLIER_ROW_PADDING,
              borderRadius: SUPPLIER_ROW_BORDER_RADIUS_PX,
              border: `1px solid ${supplier.isActive ? SUPPLIER_ROW_BORDER_COLOR : SUPPLIER_ROW_OFF_BORDER_COLOR}`,
              background: supplier.isActive ? SUPPLIER_ROW_BACKGROUND_COLOR : SUPPLIER_ROW_OFF_BACKGROUND_COLOR,
              opacity: supplier.isActive ? undefined : SUPPLIER_ROW_OFF_OPACITY,
            }}
          >
            <Dot
              color={supplier.isActive ? supplier.color : SUPPLIER_OFF_DOT_COLOR}
              size={SUPPLIER_DOT_SIZE_PX}
              className="flex-shrink-0"
            />
            <span
              className="font-monospace flex-fill text-truncate"
              style={{
                color: supplier.isActive ? SUPPLIER_NAME_COLOR : SUPPLIER_OFF_NAME_COLOR,
                fontSize: SUPPLIER_NAME_FONT_SIZE_PX,
              }}
            >
              {supplier.name}
            </span>
            <Mark
              color={supplier.isActive ? SUPPLIER_STATE_COLOR : SUPPLIER_OFF_STATE_COLOR}
              spacing={SUPPLIER_STATE_LETTER_SPACING_PX}
              isUpperCase={false}
              className="flex-shrink-0"
            >
              {supplier.isActive ? SUPPLIER_LIVE_LABEL : SUPPLIER_OFF_LABEL}
            </Mark>
          </div>
        ))}
      </div>
    </FieldSlot>
  );
}
