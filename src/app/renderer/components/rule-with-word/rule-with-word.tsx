import { Hairline } from "../hairline";
import { Mark } from "../mark";
import { QUIET_MARK_COLOR } from "../../constants";
import { RULE_WITH_WORD_GAP_PX } from "./constants";
import type { RuleWithWordProps } from "./interfaces";

/** A rule with a word in the middle: the day a stream opens, or where a person asked again. */
export function RuleWithWord({ children, color = QUIET_MARK_COLOR, className }: RuleWithWordProps) {
  return (
    <div
      className={`d-flex align-items-center${className === undefined ? "" : ` ${className}`}`}
      style={{
        gap: RULE_WITH_WORD_GAP_PX,
      }}
    >
      <Hairline className="flex-fill" />
      <Mark color={color}>{children}</Mark>
      <Hairline className="flex-fill" />
    </div>
  );
}
