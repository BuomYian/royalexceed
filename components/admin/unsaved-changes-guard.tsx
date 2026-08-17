"use client";

import { useEffect } from "react";

/** Warns before a tab close/refresh when a form has unsaved changes (spec §7). */
export function UnsavedChangesGuard({ dirty }: { dirty: boolean }) {
  useEffect(() => {
    if (!dirty) return;
    function handler(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  return null;
}
