"use client";

import { useTransition } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { inventoryInputSchema, type InventoryInput } from "@/lib/validations/inventory";
import { createInventoryUnit, updateInventoryUnit } from "@/lib/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/image-uploader";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";

const CONDITIONS = ["NEW", "CERTIFIED_PRE_OWNED", "USED"] as const;
const STATUSES = ["IN_TRANSIT", "AVAILABLE", "RESERVED", "SOLD"] as const;

function tempId() {
  return `tmp-${crypto.randomUUID()}`;
}

export function InventoryForm({
  models,
  defaultValues,
}: {
  models: { id: string; displayName: string; variants: { id: string; name: string }[] }[];
  defaultValues?: Partial<InventoryInput>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<InventoryInput>({
    resolver: zodResolver(inventoryInputSchema),
    defaultValues: {
      stockNumber: "",
      year: new Date().getFullYear(),
      colorName: "",
      mileageKm: 0,
      condition: "NEW",
      status: "IN_TRANSIT",
      images: [],
      ...defaultValues,
    },
  });

  const images = useFieldArray({ control: form.control, name: "images" });
  const selectedModelId = form.watch("modelId");
  const variants = models.find((m) => m.id === selectedModelId)?.variants ?? [];

  function onSubmit(values: InventoryInput) {
    startTransition(async () => {
      const action = values.id ? updateInventoryUnit : createInventoryUnit;
      const result = await action(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(values.id ? "Unit updated" : "Unit created");
      form.reset(values);
      router.push("/admin/inventory");
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
      <UnsavedChangesGuard dirty={form.formState.isDirty} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Stock number" error={form.formState.errors.stockNumber?.message}>
          <Input {...form.register("stockNumber")} placeholder="FBM-S07-0003" />
        </Field>
        <Field label="VIN">
          <Input {...form.register("vin")} maxLength={17} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Model" error={form.formState.errors.modelId?.message}>
          <Controller
            control={form.control}
            name="modelId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a model" /></SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Variant">
          <Controller
            control={form.control}
            name="variantId"
            render={({ field }) => (
              <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={!variants.length}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a variant" /></SelectTrigger>
                <SelectContent>
                  {variants.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Year">
          <Input type="number" {...form.register("year", { valueAsNumber: true })} />
        </Field>
        <Field label="Color" error={form.formState.errors.colorName?.message}>
          <Input {...form.register("colorName")} />
        </Field>
        <Field label="Mileage (km)">
          <Input type="number" {...form.register("mileageKm", { valueAsNumber: true })} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Condition">
          <Controller
            control={form.control}
            name="condition"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Status">
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Price (USD)">
          <Input type="number" step="0.01" {...form.register("priceUsd", { valueAsNumber: true })} />
        </Field>
      </div>

      <Field label="Arrival date">
        <Input type="date" {...form.register("arrivalDate")} />
      </Field>

      <Field label="Notes">
        <Textarea rows={3} {...form.register("notes")} />
      </Field>

      <div className="space-y-2">
        <p className="text-sm font-medium">Photos</p>
        {images.fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-3">
            <Controller
              control={form.control}
              name={`images.${index}.url`}
              render={({ field: f }) => <ImageUploader folder="inventory" value={f.value} onChange={f.onChange} label="Upload" />}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => images.remove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => images.append({ id: tempId(), url: "", alt: "" })}>
          <Plus className="h-4 w-4" /> Add photo
        </Button>
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {defaultValues?.id ? "Save changes" : "Add to inventory"}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
