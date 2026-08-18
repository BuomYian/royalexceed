"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import type { Testimonial } from "@prisma/client";
import { testimonialInputSchema } from "@/lib/validations/testimonial";
import { createTestimonial, deleteTestimonial, toggleTestimonialApproval } from "@/lib/actions/testimonials";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export function TestimonialsManager({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(testimonialInputSchema),
    defaultValues: { authorName: "", quote: "", rating: 5, isApproved: false, sortOrder: 0 },
  });

  const onCreate = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await createTestimonial(values);
      if (!result.success) toast.error(result.error);
      else {
        toast.success("Testimonial added");
        form.reset();
        setOpen(false);
        router.refresh();
      }
    });
  });

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button><Plus className="h-4 w-4" /> New testimonial</Button>} />
        <DialogContent>
          <DialogHeader><DialogTitle>New testimonial</DialogTitle></DialogHeader>
          <form onSubmit={onCreate} className="space-y-3">
            <Input placeholder="Author name" {...form.register("authorName")} />
            <Input placeholder="Title / role (optional)" {...form.register("authorTitle")} />
            <Input placeholder="Company (optional)" {...form.register("company")} />
            <Textarea placeholder="Quote" rows={3} {...form.register("quote")} />
            <Input type="number" min={1} max={5} placeholder="Rating (1-5)" {...form.register("rating", { valueAsNumber: true })} />
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-3 sm:grid-cols-2">
        {testimonials.map((t) => (
          <Card key={t.id}>
            <CardContent className="space-y-2 pt-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-sm font-medium">
                {t.authorName}
                {t.company && <span className="font-normal text-muted-foreground"> · {t.company}</span>}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant={t.isApproved ? "secondary" : "default"}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await toggleTestimonialApproval(t.id, !t.isApproved);
                      if (!result.success) toast.error(result.error);
                      else router.refresh();
                    })
                  }
                >
                  {t.isApproved ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  {t.isApproved ? "Unapprove" : "Approve"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    startTransition(async () => {
                      const result = await deleteTestimonial(t.id);
                      if (!result.success) toast.error(result.error);
                      else router.refresh();
                    })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
