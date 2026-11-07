import { HeldProject } from "./held-project.service";
import { ScheduleEars } from "./schedule-ears.service";
import { WalkRunner } from "./walk-runner.service";
import type { ScheduledTask } from "../../../contracts";
import type { ScheduledConversation, WalkHubParts } from "../interfaces";

/** A conversation of its own for each schedule: every task begins a fresh one, beside the person's and unseen. */
export class ScheduledWalks {
  private readonly conversations = new Map<string, ScheduledConversation>();

  constructor(private readonly parts: WalkHubParts) {}

  ask(scheduled: ScheduledTask): void {
    const { runner } = this.conversationOf(scheduled);

    runner.fresh();
    runner.put({
      agent: scheduled.agent,
      text: scheduled.task,
      attached: [],
      recordings: [],
    });
  }

  isOut(scheduleId: string): boolean {
    return this.conversations.get(scheduleId)?.runner.isBusy() ?? false;
  }

  /** Resolves once no schedule's walk is out and everything written has landed or been refused. */
  async whenIdle(): Promise<void> {
    await Promise.all([...this.conversations.values()].map(({ runner }) => runner.whenIdle()));
  }

  /** The schedule's conversation in this folder, handed today's config; another folder begins another. */
  private conversationOf({ scheduleId, directory, config }: ScheduledTask): ScheduledConversation {
    const held = this.conversations.get(scheduleId) ?? null;

    if (held !== null && held.project.directory === directory) {
      held.project.replace(config);

      return held;
    }

    const project = new HeldProject(directory, config);
    const listener = new ScheduleEars(this.parts.voice);
    const runner = new WalkRunner({
      project,
      record: this.parts.record,
      llm: this.parts.llm,
      providers: this.parts.providers,
      servers: this.parts.servers,
      listener,
      scheduleId,
    });
    const conversation = {
      project,
      runner,
    };

    this.conversations.set(scheduleId, conversation);

    return conversation;
  }
}
