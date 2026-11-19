import { useCallback, useEffect, useState } from "react";
import { allowMacHearing, macHearingLocales, macHearingPermission, openSpeechSettings } from "../../api";
import type { MacPermission } from "../../../../../../contracts";
import type { MacHearingState } from "../../interfaces";

/**
 * macOS's hearing while this machine has chosen it (38d, 38e): its languages read once, and its permission read again
 * whenever the window comes back, since it is given and taken in the system's settings.
 */
export function useMacHearing(isChosen: boolean): MacHearingState {
  const [permission, setPermission] = useState<MacPermission | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [locales, setLocales] = useState<string[]>([]);

  useEffect(() => {
    if (!isChosen) {
      return;
    }

    let isLive = true;
    const look = () => {
      void macHearingPermission()
        .then((read) => {
          if (isLive) {
            setPermission(read);
          }
        })
        .catch(() => undefined);
    };

    look();
    void macHearingLocales()
      .then((read) => {
        if (isLive) {
          setLocales(read);
        }
      })
      .catch(() => undefined);
    window.addEventListener("focus", look);

    return () => {
      isLive = false;
      window.removeEventListener("focus", look);
    };
  }, [isChosen]);

  const allow = useCallback(async () => {
    setIsAsking(true);

    try {
      setPermission(await allowMacHearing());
    } finally {
      setIsAsking(false);
    }
  }, []);

  return {
    permission,
    isAsking,
    locales,
    allow,
    openSettings: () => void openSpeechSettings(),
  };
}
