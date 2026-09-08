"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Client boundary around next-themes so the server layouts can stay server
 * components. `attribute="class"` matches globals.css, which defines the
 * light palette on `:root` and the dark one on `.dark`.
 *
 * The public site and the admin dashboard mount this separately with
 * different `storageKey`s — they are separate root layouts, and a shared key
 * would let a toggle on one silently re-theme the other.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      // Avoids every color token cross-fading at once when the theme flips,
      // which reads as a smear rather than a switch.
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
