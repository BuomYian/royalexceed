"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireApiAccess } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { slugify, uniqueSlug } from "@/lib/slug";
import { modelInputSchema, type ModelInput } from "@/lib/validations/model";
import { actionError, type ActionResult } from "@/lib/actions/types";

// Re-exported so the rest of lib/actions/* (established convention) can keep
// importing `ActionResult`/`actionError` from "@/lib/actions/models".
export type { ActionResult };
export { actionError };

export async function createModel(input: ModelInput): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireApiAccess("models", "create");
    const parsed = modelInputSchema.parse(input);

    const slug = await uniqueSlug(
      parsed.slug || parsed.name,
      async (candidate) => (await prisma.model.count({ where: { slug: candidate } })) > 0,
    );

    const model = await prisma.$transaction(
      async (tx) => {
        const maxSort = await tx.model.aggregate({ _max: { sortOrder: true } });
        return tx.model.create({
          data: {
            ...omitNested(parsed),
            slug,
            sortOrder: parsed.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
            variants: { create: parsed.variants.map(({ id: _id, ...v }) => v) },
            colors: { create: parsed.colors.map(({ id: _id, ...c }) => c) },
            images: { create: parsed.images.map(({ id: _id, ...i }) => i) },
            features: { create: parsed.features.map(({ id: _id, ...f }) => f) },
            specGroups: {
              create: parsed.specGroups.map(({ id: _id, specs, ...g }) => ({
                ...g,
                specs: { create: specs.map(({ id: _sid, ...s }) => s) },
              })),
            },
          },
        });
      },
      // See the comment on the same option in updateModel below.
      { timeout: 20_000, maxWait: 10_000 },
    );

    await writeAuditLog({ actorId: user.id, action: "CREATE", entity: "Model", entityId: model.id, changes: { slug } });
    revalidatePath("/admin/models");
    revalidatePath("/models");
    revalidatePath("/");
    return { success: true, data: { id: model.id } };
  } catch (error) {
    return actionError(error, "Failed to create model");
  }
}

export async function updateModel(input: ModelInput): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireApiAccess("models", "update");
    const parsed = modelInputSchema.parse(input);
    if (!parsed.id) return { success: false, error: "Missing model id" };

    const existing = await prisma.model.findUnique({ where: { id: parsed.id } });
    if (!existing) return { success: false, error: "Model not found" };

    let slug = existing.slug;
    if (parsed.slug && parsed.slug !== existing.slug) {
      slug = await uniqueSlug(parsed.slug, async (candidate) => {
        if (candidate === existing.slug) return false;
        return (await prisma.model.count({ where: { slug: candidate, id: { not: parsed.id } } })) > 0;
      });
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.model.update({ where: { id: parsed.id }, data: { ...omitNested(parsed), slug } });

        // Nested collections are fully replaced on save — simplest correct approach for
        // an admin form that submits the whole tree each time (drag-sort included).
        await tx.variant.deleteMany({ where: { modelId: parsed.id } });
        await tx.modelColor.deleteMany({ where: { modelId: parsed.id } });
        await tx.modelImage.deleteMany({ where: { modelId: parsed.id } });
        await tx.featureBlock.deleteMany({ where: { modelId: parsed.id } });
        await tx.specGroup.deleteMany({ where: { modelId: parsed.id } }); // cascades SpecItem

        if (parsed.variants.length) {
          await tx.variant.createMany({ data: parsed.variants.map(({ id: _id, ...v }) => ({ ...v, modelId: parsed.id! })) });
        }
        if (parsed.colors.length) {
          await tx.modelColor.createMany({ data: parsed.colors.map(({ id: _id, ...c }) => ({ ...c, modelId: parsed.id! })) });
        }
        if (parsed.images.length) {
          await tx.modelImage.createMany({ data: parsed.images.map(({ id: _id, ...i }) => ({ ...i, modelId: parsed.id! })) });
        }
        if (parsed.features.length) {
          await tx.featureBlock.createMany({ data: parsed.features.map(({ id: _id, ...f }) => ({ ...f, modelId: parsed.id! })) });
        }
        if (parsed.specGroups.length) {
          // One createManyAndReturn (1 round trip) instead of one tx.specGroup.create()
          // per group, then a single createMany for every group's specs flattened
          // together (1 more round trip) instead of a nested `create` per group. The
          // previous per-group loop was fine against localhost but, against a hosted
          // DB where every query is a real network round trip, a model with several
          // spec groups could blow past the interactive transaction's timeout — see
          // the `timeout` option below, which also gives real headroom for this.
          const groups = await tx.specGroup.createManyAndReturn({
            data: parsed.specGroups.map(({ id: _id, specs: _specs, ...g }) => ({ ...g, modelId: parsed.id! })),
          });
          const specs = parsed.specGroups.flatMap((group, i) =>
            group.specs.map(({ id: _sid, ...s }) => ({ ...s, groupId: groups[i].id })),
          );
          if (specs.length) {
            await tx.specItem.createMany({ data: specs });
          }
        }
      },
      // Every query above is now a real network round trip to the hosted Supabase
      // pooler rather than a localhost call, so the 5s default interactive-transaction
      // timeout was getting exceeded on models with a few spec groups (P2028). 20s
      // gives real headroom; maxWait is how long to wait for a transaction slot to
      // open, separate from the timeout itself.
      { timeout: 20_000, maxWait: 10_000 },
    );

    await writeAuditLog({ actorId: user.id, action: "UPDATE", entity: "Model", entityId: parsed.id, changes: { slug } });
    revalidatePath("/admin/models");
    revalidatePath(`/admin/models/${parsed.id}`);
    revalidatePath("/models");
    revalidatePath(`/models/${slug}`);
    revalidatePath("/");
    return { success: true, data: { id: parsed.id } };
  } catch (error) {
    return actionError(error, "Failed to update model");
  }
}

export async function deleteModel(id: string): Promise<ActionResult> {
  try {
    const user = await requireApiAccess("models", "delete");
    const inUse = await prisma.inventoryUnit.count({ where: { modelId: id } });
    if (inUse > 0) {
      return { success: false, error: "This model has inventory units linked to it and can't be deleted." };
    }
    await prisma.model.delete({ where: { id } });
    await writeAuditLog({ actorId: user.id, action: "DELETE", entity: "Model", entityId: id });
    revalidatePath("/admin/models");
    revalidatePath("/models");
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error, "Failed to delete model");
  }
}

function omitNested<T extends { variants?: unknown; colors?: unknown; images?: unknown; specGroups?: unknown; features?: unknown }>(
  input: T,
) {
  const { variants: _v, colors: _c, images: _i, specGroups: _s, features: _f, ...rest } = input;
  return rest;
}

// slugify is used by callers constructing preview slugs client-side via a server action if needed later.
export { slugify };
