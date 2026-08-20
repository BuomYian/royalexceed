"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades + slides a block in as it scrolls into view. Dependency-free
 * (IntersectionObserver + Tailwind transition classes, no animation library)
 * to protect the site's JS budget — no framer-motion or similar is installed.
 *
 * `prefers-reduced-motion` doesn't need its own branch here: globals.css
 * already zeroes every transition/animation duration site-wide for that
 * preference (see `@layer base` in app/globals.css), so this becomes an
 * instant, non-animated appearance there automatically.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger, in ms — e.g. index * 80 for a grid of cards. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Fires once — reveals stay revealed on scroll-back-up rather than
    // re-animating, which reads as polish rather than a distraction.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
