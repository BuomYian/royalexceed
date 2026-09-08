"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Testimonial = {
  id: string;
  authorName: string;
  authorTitle: string | null;
  company: string | null;
  quote: string;
  rating: number;
};

const ADVANCE_MS = 5000;

/**
 * Scroll-snap carousel rather than a transform-driven one: the browser owns
 * the scrolling, so it stays swipeable on touch, keyboard-scrollable, and
 * correct under RTL without any manual offset math (which is where hand-rolled
 * carousels usually break on the `ar` locale).
 */
export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const t = useTranslations("home");
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAutoplay(!query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Keep the dots honest when the user swipes or scrolls the track by hand.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children);
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (first) setIndex(items.indexOf(first.target));
      },
      { root: track, threshold: 0.6 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [testimonials.length]);

  /**
   * Scrolls the track and nothing else.
   *
   * This deliberately does NOT use `target.scrollIntoView()`: that scrolls
   * every scrollable ancestor, the document included, so each auto-advance
   * tick yanked the whole page down to this section. (`block: "nearest"`
   * caps how far the page moves, it doesn't stop it moving.)
   *
   * The offset is measured from live geometry and applied with `scrollBy`,
   * which keeps it correct under RTL without touching `scrollLeft` — whose
   * sign convention in RTL is the part that varies between browsers.
   */
  function scrollTo(next: number) {
    const track = trackRef.current;
    if (!track) return;
    const wrapped = (next + testimonials.length) % testimonials.length;
    const target = track.children[wrapped] as HTMLElement | undefined;
    if (!target) return;
    const delta = target.getBoundingClientRect().left - track.getBoundingClientRect().left;
    track.scrollBy({ left: delta, behavior: "smooth" });
  }

  // Only advance while the carousel is actually on screen — no reason to
  // animate a section the reader is nowhere near.
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.2,
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (testimonials.length < 2 || paused || !autoplay || !inView) return;
    const id = setInterval(() => scrollTo(index + 1), ADVANCE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, autoplay, inView, testimonials.length]);

  if (testimonials.length === 0) return null;

  return (
    <section className="container-brand py-16 sm:py-24">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("testimonialsTitle")}</h2>
        {testimonials.length > 1 && (
          <div className="flex gap-2">
            <Button variant="outline" size="icon" aria-label={t("testimonialPrev")} onClick={() => scrollTo(index - 1)}>
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <Button variant="outline" size="icon" aria-label={t("testimonialNext")} onClick={() => scrollTo(index + 1)}>
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        )}
      </div>

      <ul
        ref={trackRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        className="-mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-2 scrollbar-none"
      >
        {testimonials.map((item) => (
          <li
            key={item.id}
            className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]"
          >
            <figure className="h-full rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
              <Quote className="mb-3 h-6 w-6 text-primary/40" aria-hidden="true" />
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                ))}
              </div>
              <blockquote className="text-sm">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-medium">{item.authorName}</span>
                {item.company && <span className="text-muted-foreground"> · {item.company}</span>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {testimonials.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {testimonials.map((item, i) => (
            <button
              key={item.id}
              onClick={() => scrollTo(i)}
              aria-label={`${t("testimonialsTitle")} ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-8 bg-primary" : "w-4 bg-foreground/25 hover:bg-foreground/40",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
