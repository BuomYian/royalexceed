import { prisma } from "@/lib/prisma";

export async function getApprovedTestimonials(limit = 8) {
  return prisma.testimonial.findMany({
    where: { isApproved: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
}
