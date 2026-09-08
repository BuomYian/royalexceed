"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HeroSlide = { id: string; imageUrl: string; headline: string; subheadline?: string; modelSlug?: string };

const SLIDE_MS = 6000;

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const t = useTranslations("home");
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoplay, setAutoplay] = useState(true);

  // Auto-rotation is motion the user didn't ask for, so honour the OS
  // setting and leave the carousel on manual controls instead.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAutoplay(!query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (slides.length < 2 || paused || !autoplay) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [slides.length, paused, autoplay]);

  const slide = slides[active];
  if (!slide) return null;

  return (
    <section
      className="relative flex min-h-[85vh] items-end overflow-hidden sm:min-h-[90vh]"
      // Pausing on hover/focus keeps the banner from swapping out from under
      // someone who is reading it or tabbing through its CTAs.
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none",
            i === active ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={i !== active}
        >
          <Image
            // Remounts on each activation so the slow zoom restarts from 1x.
            key={`${s.id}-${i === active ? active : "idle"}`}
            src={s.imageUrl}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
            style={
              i === active
                ? {
                    animation: `hero-kenburns ${SLIDE_MS + 1500}ms ease-out forwards`,
                    animationPlayState: paused ? "paused" : "running",
                  }
                : undefined
            }
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />

      <div className="container-brand relative z-10 pb-14 sm:pb-20">
        {/* Keyed on the slide so the copy re-animates in as the banner changes,
            instead of the headline silently swapping under a static layout. */}
        <div key={slide.id} className="max-w-2xl space-y-5 duration-700 animate-in fade-in slide-in-from-bottom-4">
          <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">Art of Quality</p>
          <h1 className="font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            {slide.headline}
          </h1>
          {slide.subheadline && <p className="text-lg text-foreground/80">{slide.subheadline}</p>}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="lg" render={<Link href="/test-drive">{t("heroCta1")}</Link>} />
            <Button size="lg" variant="outline" render={<Link href="/models">{t("heroCta2")}</Link>} />
          </div>
        </div>

        {slides.length > 1 && (
          <div className="mt-8 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "h-1.5 overflow-hidden rounded-full transition-all duration-300",
                  i === active ? "w-10 bg-foreground/25" : "w-4 bg-foreground/30 hover:bg-foreground/50",
                )}
              >
                {i === active && (
                  // Fills across the dot for the life of the slide, so the
                  // banner visibly tells you when it is about to advance.
                  <span
                    key={active}
                    className="block h-full w-full origin-left rounded-full bg-primary rtl:origin-right"
                    style={{
                      animation: autoplay ? `hero-progress ${SLIDE_MS}ms linear forwards` : undefined,
                      animationPlayState: paused ? "paused" : "running",
                      transform: autoplay ? undefined : "scaleX(1)",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
