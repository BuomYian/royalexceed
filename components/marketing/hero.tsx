"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HeroSlide = { id: string; imageUrl: string; headline: string; subheadline?: string; modelSlug?: string };

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const t = useTranslations("home");
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const slide = slides[active];
  if (!slide) return null;

  return (
    <section className="relative flex min-h-[85vh] items-end overflow-hidden sm:min-h-[90vh]">
      {slides.map((s, i) => (
        <Image
          key={s.id}
          src={s.imageUrl}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-1000 motion-reduce:transition-none",
            i === active ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />

      <div className="container-brand relative z-10 pb-14 sm:pb-20">
        <div className="max-w-2xl space-y-5">
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
                className={cn("h-1.5 rounded-full transition-all", i === active ? "w-8 bg-primary" : "w-4 bg-foreground/30")}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
