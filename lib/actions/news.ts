"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import DOMPurify from "isomorphic-dompurify";
import { prisma } from "@/lib/prisma";
import { requireApiAccess } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { uniqueSlug } from "@/lib/slug";
import { articleInputSchema, type ArticleInput } from "@/lib/validations/article";
import type { ActionResult } from "@/lib/actions/models";

export async function createArticle(raw: ArticleInput): Promise<ActionResult<{ id: string; slug: string }>> {
  const user = await requireApiAccess("news", "create");
  const parsed = articleInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const input = parsed.data;
  const slug = await uniqueSlug(
    input.slug || input.title,
    async (candidate) => (await prisma.article.count({ where: { slug: candidate } })) > 0,
  );

  const article = await prisma.article.create({
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt,
      body: DOMPurify.sanitize(input.body),
      coverImageUrl: input.coverImageUrl,
      tags: input.tags,
      status: input.status,
      publishedAt: input.status === "PUBLISHED" ? new Date(input.publishedAt ?? Date.now()) : input.publishedAt ? new Date(input.publishedAt) : null,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      authorId: user.id,
    },
  });

  await writeAuditLog({ actorId: user.id, action: "CREATE", entity: "Article", entityId: article.id });
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidateTag("articles", "max");
  return { success: true, data: { id: article.id, slug: article.slug } };
}

export async function updateArticle(raw: ArticleInput): Promise<ActionResult<{ id: string; slug: string }>> {
  const user = await requireApiAccess("news", "update");
  if (!raw.id) return { success: false, error: "Missing id" };
  const parsed = articleInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const input = parsed.data;
  const existing = await prisma.article.findUnique({ where: { id: raw.id } });
  if (!existing) return { success: false, error: "Not found" };

  let slug = existing.slug;
  if (input.slug && input.slug !== existing.slug) {
    slug = await uniqueSlug(input.slug, async (candidate) => {
      if (candidate === existing.slug) return false;
      return (await prisma.article.count({ where: { slug: candidate, NOT: { id: raw.id } } })) > 0;
    });
  }

  await prisma.article.update({
    where: { id: raw.id },
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt,
      body: DOMPurify.sanitize(input.body),
      coverImageUrl: input.coverImageUrl,
      tags: input.tags,
      status: input.status,
      publishedAt:
        input.status === "PUBLISHED" && !existing.publishedAt
          ? new Date()
          : input.publishedAt
            ? new Date(input.publishedAt)
            : existing.publishedAt,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
    },
  });

  await writeAuditLog({ actorId: user.id, action: "UPDATE", entity: "Article", entityId: raw.id });
  revalidatePath("/admin/news");
  revalidatePath(`/news/${slug}`);
  revalidateTag("articles", "max");
  return { success: true, data: { id: raw.id, slug } };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const user = await requireApiAccess("news", "delete");
  await prisma.article.delete({ where: { id } });
  await writeAuditLog({ actorId: user.id, action: "DELETE", entity: "Article", entityId: id });
  revalidatePath("/admin/news");
  revalidateTag("articles", "max");
  return { success: true, data: undefined };
}
