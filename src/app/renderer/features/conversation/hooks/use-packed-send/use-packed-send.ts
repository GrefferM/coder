import { useCallback, useRef } from "react";
import { packAttachments } from "../../api";
import type { PackedSendHands } from "./interfaces";
import type { PackedSend } from "../../interfaces";

/**
 * Sends a question with files: files are read only now, up to the ceiling; the question then goes in its typed stream,
 * or returns to its field if packing failed or the person left that stream. A stream being packed sends nothing else.
 */
export function usePackedSend(streamNow: () => string): PackedSendHands {
  const packing = useRef(new Set<string>());

  const isPacking = useCallback((stream: string) => packing.current.has(stream), []);

  const send = useCallback(
    ({ stream, picked, ceiling, onPacked, onGivenBack }: PackedSend) => {
      packing.current.add(stream);

      void packAttachments(
        picked.map((one) => one.path),
        ceiling,
      )
        .then((packed) => {
          if (streamNow() !== stream) {
            onGivenBack();

            return;
          }

          onPacked(packed);
        }, onGivenBack)
        .finally(() => {
          packing.current.delete(stream);
        });
    },
    [streamNow],
  );

  return {
    isPacking,
    send,
  };
}
