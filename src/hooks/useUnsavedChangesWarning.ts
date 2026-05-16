import { useEffect } from "react";

const defaultWarningMessage =
  "You have unsaved changes. Are you sure you want to leave?";

export const useUnsavedChangesWarning = (
  enabled: boolean,
  message = defaultWarningMessage
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;

      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, message]);
};
