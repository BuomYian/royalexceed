"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-brand flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold tracking-widest text-muted-foreground">500</p>
      <h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        We hit an unexpected error loading this page. Please try again, or reach us on WhatsApp if
        it keeps happening.
      </p>
      <Button className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
