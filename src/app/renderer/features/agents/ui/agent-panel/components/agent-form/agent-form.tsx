import { useEffect, useState } from "react";
import { ActionButton, Field } from "../../../../../../components";
import {
  FIELD_INVALID_MS,
  FIELD_LABEL_COLOR,
  FIELD_LABEL_FONT_SIZE_PX,
  FIELD_LABEL_GAP_PX,
} from "../../../../../../components/field/constants";
import { errorMessage } from "../../../../../../utils/errors";
import { ModelPicker } from "../model-picker";
import {
  AGENT_FORM_ACTION_GAP_PX,
  AGENT_FORM_AVATAR_BORDER_COLOR,
  AGENT_FORM_AVATAR_BORDER_RADIUS_PX,
  AGENT_FORM_AVATAR_COLOR,
  AGENT_FORM_AVATAR_SIZE_PX,
  AGENT_FORM_CANCEL_LABEL,
  AGENT_FORM_CREATE_LABEL,
  AGENT_FORM_ERROR_COLOR,
  AGENT_FORM_GAP_PX,
  AGENT_FORM_HEADER_GAP_PX,
  AGENT_FORM_MODEL_LABEL,
  AGENT_FORM_MUTED_COLOR,
  AGENT_FORM_MUTED_FONT_SIZE_PX,
  AGENT_FORM_NAME_LABEL,
  AGENT_FORM_NO_MODELS_NOTE,
  AGENT_FORM_PADDING_PX,
  AGENT_FORM_TITLE,
  AGENT_FORM_TITLE_COLOR,
  AGENT_FORM_TITLE_FONT_SIZE_PX,
} from "./constants";
import type { AgentFormProps } from "./interfaces";

/** Create-agent form; occupies the settings' place until an agent exists. */
export function AgentForm({ models, agents, onCreate, onCancel }: AgentFormProps) {
  const [name, setName] = useState("");
  const [modelId, setModelId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [wasTried, setWasTried] = useState(false);

  useEffect(() => {
    if (!wasTried) {
      return;
    }

    const fading = window.setTimeout(() => setWasTried(false), FIELD_INVALID_MS);

    return () => window.clearTimeout(fading);
  }, [wasTried]);

  async function create() {
    setError(null);

    if (!name || !modelId) {
      setWasTried(true);

      return;
    }

    try {
      await onCreate(name, modelId);
      setName("");
      setModelId("");
      setWasTried(false);
    } catch (reason) {
      setError(errorMessage(reason));
    }
  }

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        padding: AGENT_FORM_PADDING_PX,
        gap: AGENT_FORM_GAP_PX,
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: AGENT_FORM_HEADER_GAP_PX,
        }}
      >
        <span
          className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: AGENT_FORM_AVATAR_SIZE_PX,
            height: AGENT_FORM_AVATAR_SIZE_PX,
            borderRadius: AGENT_FORM_AVATAR_BORDER_RADIUS_PX,
            border: `1px dashed ${AGENT_FORM_AVATAR_BORDER_COLOR}`,
            color: AGENT_FORM_AVATAR_COLOR,
          }}
        >
          +
        </span>
        <span
          style={{
            color: AGENT_FORM_TITLE_COLOR,
            fontSize: AGENT_FORM_TITLE_FONT_SIZE_PX,
            fontWeight: 600,
          }}
        >
          {AGENT_FORM_TITLE}
        </span>
      </div>

      <Field label={AGENT_FORM_NAME_LABEL} isInvalid={wasTried && !name} value={name} onChange={setName} />

      <div
        className="d-flex flex-column"
        style={{
          gap: FIELD_LABEL_GAP_PX,
        }}
      >
        <span
          className="text-uppercase font-monospace"
          style={{
            color: FIELD_LABEL_COLOR,
            fontSize: FIELD_LABEL_FONT_SIZE_PX,
          }}
        >
          {AGENT_FORM_MODEL_LABEL}
        </span>
        <ModelPicker
          models={models}
          agents={agents}
          modelId={modelId}
          isInvalid={wasTried && !modelId}
          onModelIdChange={setModelId}
        />
        {models.length === 0 && (
          <span
            className="font-monospace"
            style={{
              color: AGENT_FORM_MUTED_COLOR,
              fontSize: AGENT_FORM_MUTED_FONT_SIZE_PX,
            }}
          >
            {AGENT_FORM_NO_MODELS_NOTE}
          </span>
        )}
      </div>

      {error !== null && (
        <span
          style={{
            color: AGENT_FORM_ERROR_COLOR,
            fontSize: AGENT_FORM_MUTED_FONT_SIZE_PX,
          }}
        >
          {error}
        </span>
      )}

      <div
        data-foot
        className="d-flex mt-auto"
        style={{
          gap: AGENT_FORM_ACTION_GAP_PX,
        }}
      >
        <ActionButton variant="cancel" label={AGENT_FORM_CANCEL_LABEL} onClick={onCancel} />
        <ActionButton variant="save" label={AGENT_FORM_CREATE_LABEL} onClick={() => void create()} />
      </div>
    </div>
  );
}
