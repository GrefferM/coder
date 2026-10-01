import { FieldSlot, Mark, Segmented } from "../../../../../../../../components";
import {
  SETTING_ROW_HINT_COLOR,
  SETTING_ROW_HINT_LINE_HEIGHT,
} from "../../../../../../../../components/setting-row/constants";
import { MEMORY_SECTION_GAP_PX, MEMORY_SECTION_HINTS, MEMORY_SECTION_LABEL, MEMORY_SECTION_OPTIONS } from "./constants";
import type { MemorySectionProps } from "./interfaces";

/** What the agent remembers: a head, the three memories on one track, and what the chosen one gives. */
export function MemorySection({ memory, wasValue, onMemoryChange }: MemorySectionProps) {
  return (
    <FieldSlot label={MEMORY_SECTION_LABEL} wasValue={wasValue}>
      <div
        className="d-flex flex-column"
        style={{
          gap: MEMORY_SECTION_GAP_PX,
        }}
      >
        <Segmented options={MEMORY_SECTION_OPTIONS} value={memory} onChange={onMemoryChange} />
        <Mark color={SETTING_ROW_HINT_COLOR} lineHeight={SETTING_ROW_HINT_LINE_HEIGHT} isUpperCase={false}>
          {MEMORY_SECTION_HINTS[memory]}
        </Mark>
      </div>
    </FieldSlot>
  );
}
