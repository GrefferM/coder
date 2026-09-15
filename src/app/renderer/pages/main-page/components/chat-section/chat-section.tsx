import { AgentChat, ChatTabs } from "../../../../features/conversation";
import { RunHistory } from "../../../../features/record";
import type { ChatSectionProps } from "./interfaces";

/** The chat's own section — the two faces of it, the live stream and the list of what has been. */
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
        // The quiet dot of another conversation, on the list it speaks about.
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
            // What is out belongs to the conversation on screen — a run opened out of the
            // history is a stream like any other, and each turn stands in its own question's block.
            working: chat.working,
            openCalls: chat.openCalls,
            saidAgain: chat.saidAgain,
            // The message the search stands on — the row's promise, or the match Enter walked to.
            foundId: stream.foundId,
          }}
          field={{
            draft: chat.draft,
            height: chat.fieldHeight,
            isWalking: chat.working.length > 0,
            onDraftChange: chat.changeDraft,
            onHeight: chat.setFieldHeight,
            onSend: chat.send,
            onStop: chat.stop,
          }}
          band={{
            head: stream.head,
            /*
              The stream's own field stands over the stream, under the band — one word for both faces of the
              section, and the count here is this stream's own matches and not the record's.
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
          isFailed={stream.isFailed}
          onOpen={stream.openRun}
          onForget={stream.armForget}
        />
      )}
    </div>
  );
}
