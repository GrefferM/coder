import { useCallback, useRef } from "react";
import { packAttachments } from "../../api";
import type { PackedSendHands } from "./interfaces";
import type { PackedSend } from "../../interfaces";

/**
 * A question sent with files attached. The files are read only now, and no further than the ceiling allows; the
 * question then goes in the stream it was typed in, or comes back to its field where the pack failed or the
 * person has left that stream meanwhile. While a stream's question is being packed, that stream sends nothing else.
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
