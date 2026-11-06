import { Refusal } from "../../../utils/refusals";
import { WALKS_NOT_OPEN } from "../constants";
import { walkSnapshot } from "../logic";
import { HeldProject } from "./held-project.service";
import { WalkEars } from "./walk-ears.service";
import { WalkRunner } from "./walk-runner.service";
import type { ChatMessage, ProjectConfig, PutWalk, PutWalkAnswer, WalkSnapshot } from "../../../contracts";
import type { EarsOwner, WalkHubParts, WalkListener } from "../interfaces";

/** The conversation of the open project: one runner at a time, begun by the screen and told back by push. */
export class WalkHub implements EarsOwner {
  private runner: WalkRunner | null = null;
  private project: HeldProject | null = null;
  private ears: WalkEars | null = null;

  constructor(private readonly parts: WalkHubParts) {}

  isHearing(ears: WalkListener): boolean {
    return this.ears === ears;
  }

  /** The conversation of this project; one already going on in it is kept, with the config it is handed. */
  open(directory: string, config: ProjectConfig): WalkSnapshot {
    if (this.runner !== null && this.project?.directory === directory) {
      this.project.replace(config);

      return walkSnapshot(this.runner.snapshot());
    }

    this.runner?.stop();
    this.project = new HeldProject(directory, config);
    this.ears = new WalkEars(this.parts.voice, this);
    this.runner = new WalkRunner({
      project: this.project,
      record: this.parts.record,
      llm: this.parts.llm,
      providers: this.parts.providers,
      servers: this.parts.servers,
      listener: this.ears,
    });

    return walkSnapshot(this.runner.snapshot());
  }

  configure(config: ProjectConfig): void {
    this.project?.replace(config);
  }

  /** The walks as they stand, or null while no project's conversation is open. */
  snapshot(): WalkSnapshot | null {
    return this.runner === null ? null : walkSnapshot(this.runner.snapshot());
  }

  /** Puts the person's question to an agent; null where it did not go: no such agent, nothing asked, or a walk out. */
  put(ask: PutWalk): PutWalkAnswer | null {
    const { agentId, text, attached, recordings } = ask;
    const runner = this.opened();
    const agent = this.project?.configNow().agents.find((held) => held.id === agentId) ?? null;

    if (agent === null || text.trim() === "" || runner.isBusy()) {
      return null;
    }

    return runner.put({
      agent,
      text,
      attached,
      recordings,
    });
  }

  stop(): void {
    this.runner?.stop();
  }

  /** Resolves once no walk is out and everything written has landed or been refused. */
  async whenIdle(): Promise<void> {
    await this.runner?.whenIdle();
  }

  sayAgain(said: ChatMessage): void {
    this.opened().sayAgain(said);
  }

  fresh(): void {
    this.runner?.fresh();
  }

  goOnIn(runId: string | null): void {
    this.opened().goOnIn(runId);
  }

  letGo(runId: string): void {
    this.runner?.letGo(runId);
  }

  private opened(): WalkRunner {
    if (this.runner === null) {
      throw new Refusal(WALKS_NOT_OPEN);
    }

    return this.runner;
  }
}
