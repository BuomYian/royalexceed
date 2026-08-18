import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { ModelForm } from "@/components/admin/model-form";
import type { ModelInput } from "@/lib/validations/model";

export const metadata = { title: "Edit model" };

export default async function EditModelPage({ params }: PageProps<"/admin/models/[id]">) {
  await requirePageAccess("models", "read");
  const { id } = await params;

  const model = await prisma.model.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { sortOrder: "asc" } },
      colors: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      features: { orderBy: { sortOrder: "asc" } },
      specGroups: { orderBy: { sortOrder: "asc" }, include: { specs: { orderBy: { sortOrder: "asc" } } } },
    },
  });

  if (!model) notFound();

  const defaultValues: Partial<ModelInput> = {
    ...model,
    startingPriceUsd: model.startingPriceUsd ? Number(model.startingPriceUsd) : null,
    tagline: model.tagline ?? undefined,
    metaTitle: model.metaTitle ?? undefined,
    metaDescription: model.metaDescription ?? undefined,
    variants: model.variants.map((v) => ({ ...v, priceUsd: v.priceUsd ? Number(v.priceUsd) : null, engine: v.engine ?? undefined })),
    colors: model.colors,
    images: model.images.map((i) => ({ ...i, category: i.category as "exterior" | "interior" | "detail" })),
    features: model.features.map((f) => ({ ...f, layout: f.layout as "image-right" | "image-left" | "full-bleed" })),
    specGroups: model.specGroups.map((g) => ({
      ...g,
      specs: g.specs.map((s) => ({ ...s, unit: s.unit ?? undefined })),
    })),
  };

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Edit {model.displayName}</h1>
      <ModelForm defaultValues={defaultValues} />
    </div>
  );
}
