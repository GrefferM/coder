import { ServersPanel } from "../../../../features/servers";
import type { ServersSectionProps } from "./interfaces";

/** The catalogue of servers, and the form over it while one is declared. */
export function ServersSection({ project, state, consent, section, wayOut, onShowCall }: ServersSectionProps) {
  return (
    <ServersPanel
      catalogue={{
        servers: project.config.servers,
        looks: state.looks,
        askingSince: state.askingSince,
        agents: project.config.agents,
      }}
      declaring={{
        openServerId: section.openServerId,
        form: section.form,
        held: section.held,
        secrets: section.secrets,
      }}
      serverActs={{
        onRestart: consent.raise,
        onCancel: state.cancel,
        onAskAgain: state.look,
        onSeen: state.seen,
        onShowCall,
        onArm: section.arm,
      }}
      declaringActs={{
        onOpenForm: (serverId) => wayOut.guard(() => section.openForm(serverId)),
        onFormChange: section.editForm,
        onSecretChange: section.editSecret,
        onSaveForm: section.saveForm,
        onCancelForm: () => wayOut.guard(() => section.openForm(null), "drop"),
      }}
    />
  );
}
