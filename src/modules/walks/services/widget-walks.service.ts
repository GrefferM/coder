import { walkSnapshot } from "../logic";
import { HeldProject } from "./held-project.service";
import { WalkRunner } from "./walk-runner.service";
import { WidgetEars } from "./widget-ears.service";
import type { PutWalkAnswer, WidgetAsk, WidgetWalk } from "../../../contracts";
import type { WidgetConversation, WidgetWalksParts } from "../interfaces";

/**
 * The widget's conversations (52k): one for each sphere, kept between questions so a question can follow the last, and
 * all let go when the widget's project changes.
 */
export class WidgetWalks {
  private readonly conversations = new Map<string, WidgetConversation>();
  private directory: string | null = null;

  constructor(private readonly parts: WidgetWalksParts) {}

  /** Every sphere's conversation in this folder; another folder lets the last one's go. */
  walks(directory: string): WidgetWalk[] {
    this.follow(directory);

    return [...this.conversations.entries()].map(([agentId, { runner }]) => ({
      agentId,
      snapshot: walkSnapshot(runner.snapshot()),
    }));
  }

  /** Puts the question to its sphere; null where it did not go: no such agent, nothing asked, or a walk out. */
  put(ask: WidgetAsk): PutWalkAnswer | null {
    const { directory, config, agentId, text, attached } = ask;
    const agent = config.agents.find((held) => held.id === agentId) ?? null;

    this.follow(directory);

    if (agent === null || text.trim() === "") {
      return null;
    }

    const { project, runner } = this.conversationOf(agentId, ask);

    project.replace(config);

    if (runner.isBusy()) {
      return null;
    }

    return runner.put({
      agent,
      text,
      attached,
      recordings: [],
    });
  }

  stop(agentId: string): void {
    this.conversations.get(agentId)?.runner.stop();
  }

  fresh(agentId: string): void {
    this.conversations.get(agentId)?.runner.fresh();
  }

  /** Resolves once no sphere's walk is out and everything written has landed or been refused. */
  async whenIdle(): Promise<void> {
    await Promise.all([...this.conversations.values()].map(({ runner }) => runner.whenIdle()));
  }

  /** Another folder than the one held: every conversation of the last is stopped and let go. */
  private follow(directory: string): void {
    if (this.directory === directory) {
      return;
    }

    this.conversations.forEach(({ runner }) => runner.stop());
    this.conversations.clear();
    this.directory = directory;
  }

  private conversationOf(agentId: string, { directory, config }: WidgetAsk): WidgetConversation {
    const held = this.conversations.get(agentId) ?? null;

    if (held !== null) {
      return held;
    }

    const project = new HeldProject(directory, config);
    const listener = new WidgetEars(agentId, this.parts.widget, this.parts.voice);
    const runner = new WalkRunner({
      project,
      record: this.parts.record,
      llm: this.parts.llm,
      providers: this.parts.providers,
      servers: this.parts.servers,
      listener,
      scheduleId: null,
    });
    const conversation = {
      project,
      runner,
    };

    this.conversations.set(agentId, conversation);

    return conversation;
  }
}
