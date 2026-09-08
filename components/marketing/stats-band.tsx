"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Car, Warehouse, MapPin, ShieldCheck } from "lucide-react";

type Stat = {
  key: "models" | "stock" | "countries" | "genuine";
  value: number;
  suffix?: string;
  icon: typeof Car;
};

/**
 * Counts each figure up from zero the first time the band scrolls into view.
 *
 * Uses requestAnimationFrame rather than a CSS/animation library (none is
 * installed — see components/shared/reveal.tsx for the same constraint), and
 * honours `prefers-reduced-motion` by jumping straight to the final value:
 * globals.css can zero a transition duration, but it can't stop a JS loop.
 */
function useCountUp(target: number, start: boolean, durationMs = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    // Reduced motion collapses the duration instead of short-circuiting to a
    // bare setValue() — every state write then happens inside the rAF
    // callback rather than synchronously in this effect body.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 0 : durationMs;

    let frame = 0;
    const startedAt = performance.now();

    function tick(now: number) {
      const progress = duration <= 0 ? 1 : Math.min((now - startedAt) / duration, 1);
      // easeOutCubic — fast start, gentle settle, so the number lands rather
      // than stopping dead.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start, durationMs]);

  return value;
}

function StatItem({ stat, start }: { stat: Stat; start: boolean }) {
  const t = useTranslations("home");
  const value = useCountUp(stat.value, start);
  const Icon = stat.icon;

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
      <p className="font-heading text-4xl font-extrabold tabular-nums sm:text-5xl">
        {value}
        {stat.suffix}
      </p>
      <p className="text-sm text-muted-foreground">{t(`stats.${stat.key}`)}</p>
    </div>
  );
}

export function StatsBand({ modelCount, unitsInStock }: { modelCount: number; unitsInStock: number }) {
  const t = useTranslations("home");
  const ref = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stats: Stat[] = [
    { key: "models", value: modelCount, suffix: "", icon: Car },
    { key: "stock", value: unitsInStock, suffix: "", icon: Warehouse },
    { key: "countries", value: 2, suffix: "", icon: MapPin },
    { key: "genuine", value: 100, suffix: "%", icon: ShieldCheck },
  ];

  return (
    <section ref={ref} className="border-y border-border/60 bg-card/40">
      <div className="container-brand py-12 sm:py-16">
        <h2 className="sr-only">{t("statsTitle")}</h2>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatItem key={stat.key} stat={stat} start={started} />
          ))}
        </div>
      </div>
    </section>
  );
}
