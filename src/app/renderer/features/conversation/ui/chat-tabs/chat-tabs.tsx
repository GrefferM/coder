import {
  CHAT_TABS_GAP_PX,
  CHAT_TABS_HISTORY_LABEL,
  CHAT_TABS_PADDING,
  CHAT_TABS_RULE_COLOR,
  CHAT_TABS_STREAM_LABEL,
} from "./constants";
import type { ChatTabsProps, TabRow } from "./interfaces";
import { ForgetAll, Fresh, Tab } from "./components";

/** The stream and the history as two tabs of one section. */
export function ChatTabs({ active, runs, isNews, onFresh, onForgetAll, onActiveChange }: ChatTabsProps) {
  const tabs: TabRow[] = [
    {
      id: "stream",
      label: CHAT_TABS_STREAM_LABEL,
      isNews: false,
    },
    {
      id: "history",
      label: CHAT_TABS_HISTORY_LABEL,
      // The dot stands on the list it concerns and goes out when that list is opened.
      isNews: isNews && active !== "history",
    },
  ];

  return (
    <div
      role="tablist"
      className="d-flex flex-shrink-0"
      style={{
        padding: CHAT_TABS_PADDING,
        gap: CHAT_TABS_GAP_PX,
        borderBottom: `1px solid ${CHAT_TABS_RULE_COLOR}`,
      }}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          label={tab.label}
          isActive={tab.id === active}
          isNews={tab.isNews}
          onSelect={() => onActiveChange(tab.id)}
        />
      ))}
      {/* One act per tab, in the one place the row keeps for it. */}
      {active === "stream" && <Fresh onFresh={onFresh} />}
      {active === "history" && <ForgetAll runs={runs} onForgetAll={onForgetAll} />}
    </div>
  );
}
