import Image from "next/image";
import { cn } from "@/lib/utils";

// Layout size handed to next/image: the lockup's true 3.125:1 ratio at roughly
// the largest size it is ever rendered at. The files themselves are 900px wide
// (see scripts/build-brand-assets.js) — declaring *that* here would have Next
// build a srcset around 900px and ship a 1920px variant for a 40px-tall header
// mark. Callers scale it with `h-*`, and since `w-auto` holds the ratio the
// reserved box stays correct.
const LOCKUP = { width: 250, height: 80 };

/**
 * The full "211Motors" lockup — car silhouette over the wordmark.
 *
 * Two files, not one: the wordmark is near-black, so it vanishes on the dark
 * palette. The light/dark pair is chosen in CSS off the `dark` class rather
 * than from `useTheme()`, matching ThemeToggle — next-themes sets that class
 * before hydration, so the right one paints on the first frame and this stays
 * a server component.
 *
 * Size it by height (`h-8 w-auto`); the lockup is a wide 3.1:1.
 */
export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <>
      <Image
        src="/brand/logo-211motors.png"
        alt="211Motors"
        {...LOCKUP}
        priority={priority}
        className={cn("w-auto dark:hidden", className)}
      />
      <Image
        src="/brand/logo-211motors-dark.png"
        alt="211Motors"
        {...LOCKUP}
        priority={priority}
        className={cn("hidden w-auto dark:block", className)}
      />
    </>
  );
}
