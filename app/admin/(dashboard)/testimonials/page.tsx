import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { TestimonialsManager } from "@/components/admin/testimonials-manager";

export const metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  await requirePageAccess("testimonials", "read");
  const testimonials = await prisma.testimonial.findMany({ orderBy: [{ isApproved: "asc" }, { sortOrder: "asc" }] });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold">Testimonials</h1>
        <p className="text-sm text-muted-foreground">{testimonials.length} testimonial(s)</p>
      </div>
      <TestimonialsManager testimonials={testimonials} />
    </div>
  );
}
