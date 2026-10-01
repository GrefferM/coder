import { AgentChat, ChatTabs } from "../../../../features/conversation";
import { RunHistory } from "../../../../features/record";
import type { ChatSectionProps } from "./interfaces";

/** The chat section: the live stream and the list of past runs. */
export function ChatSection({
  chat,
  stream,
  agents,
  aimed,
  onOpenDebug,
  onOpenProviders,
  onOpenModel,
  onOpenAgentAt,
}: ChatSectionProps) {
  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minHeight: 0,
      }}
    >
      <ChatTabs
        active={stream.tab}
        onFresh={stream.fresh}
        runs={stream.endedRuns.length}
        // The quiet dot of another conversation, on the list.
        isNews={chat.isNewsElsewhere}
        onForgetAll={stream.armForgetAll}
        onActiveChange={stream.showTab}
      />
      {stream.tab === "stream" ? (
        <AgentChat
          aimed={{
            id: chat.aimedAgentId,
            name: aimed?.name ?? "",
            color: aimed?.color ?? "",
            isActive: aimed?.isActive ?? false,
            waiting: chat.waiting.find((one) => one.agentId === chat.aimedAgentId) ?? null,
          }}
          said={{
            messages: stream.messages,
            agents: stream.agents,
            // What is out belongs to the conversation on screen; each turn stands in its question's block.
            working: chat.working,
            openCalls: chat.openCalls,
            saidAgain: chat.saidAgain,
            // The message the search stands on: the row's promise, or the match Enter walked to.
            foundId: stream.foundId,
          }}
          field={{
            draft: chat.draft,
            height: chat.fieldHeight,
            isWalking: chat.working.length > 0,
            onDraftChange: chat.changeDraft,
            onHeight: chat.setFieldHeight,
            attachments: chat.attachments,
            onAttach: chat.attach,
            onDetach: chat.detach,
            onSend: chat.send,
            onStop: chat.stop,
          }}
          band={{
            head: stream.head,
            // An empty stream has nothing to export.
            onExport: stream.messages.length === 0 ? null : stream.exportChat,
            /*
             * The stream's field stands over the stream, one for both faces; the count is this stream's matches, not the record's.
             */
            search: {
              query: stream.query,
              isTyping: stream.isTyping,
              at: stream.standingAt,
              found: stream.inStream.length,
              onQuery: stream.search,
              onOpen: stream.openSearch,
              onClose: stream.closeSearch,
              onNext: stream.toNextFound,
              onPrevious: stream.toPreviousFound,
            },
          }}
          acts={{
            onOpenProviders,
            onOpenModel,
            onOpenSettings: () => onOpenAgentAt("number"),
            onOpenPrompt: () => onOpenAgentAt("prompt"),
            onOpenGrants: () => onOpenAgentAt("grants"),
            onAskAgain: chat.sayAgain,
            // The projection is opened from the walk whose pass it shows.
            onOpenDebug,
          }}
        />
      ) : (
        <RunHistory
          runs={stream.runs}
          agents={agents}
          query={stream.query}
          hits={stream.hits}
          onQuery={stream.search}
          refusal={stream.refusal}
          onOpen={stream.openRun}
          onForget={stream.armForget}
        />
      )}
    </div>
  );
}
