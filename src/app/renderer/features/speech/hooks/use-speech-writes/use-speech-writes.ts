import { useCallback } from "react";
import { WRITE_SPEECH_LABEL } from "../../constants";
import type { OpenProject } from "../../../../interfaces";
import type { ProjectWrite } from "../../../project";
import type { SpeechWrites } from "./interfaces";

/** Every write speech makes to the project file, through the project's one writer. */
export function useSpeechWrites(project: OpenProject, write: ProjectWrite): SpeechWrites {
  const { save } = write;

  const chooseListenModel = useCallback(
    async (modelId: string) => {
      await save(
        {
          ...project.config,
          speech: {
            ...project.config.speech,
            listenModelId: modelId,
          },
        },
        WRITE_SPEECH_LABEL,
      );
    },
    [project.config, save],
  );

  return {
    chooseListenModel,
  };
}
