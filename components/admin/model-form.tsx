"use client";

import { useState, useTransition, useId, isValidElement, cloneElement } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { modelInputSchema, type ModelInput } from "@/lib/validations/model";
import { createModel, updateModel } from "@/lib/actions/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/image-uploader";
import { DragSortList } from "@/components/admin/drag-sort-list";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";

const BODY_TYPES = ["SUV", "CROSSOVER", "SEDAN", "HATCHBACK", "PICKUP", "MPV", "VAN"] as const;
const FUEL_TYPES = ["PETROL", "DIESEL", "HYBRID", "PLUGIN_HYBRID", "ELECTRIC"] as const;
const TRANSMISSIONS = ["MANUAL", "AUTOMATIC", "DCT", "CVT"] as const;
const DRIVETRAINS = ["FWD", "RWD", "AWD", "FOUR_WD"] as const;

function tempId() {
  return `tmp-${crypto.randomUUID()}`;
}

export function ModelForm({ defaultValues }: { defaultValues?: Partial<ModelInput> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState("general");

  const form = useForm<ModelInput>({
    resolver: zodResolver(modelInputSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      bodyType: "SUV",
      seats: 5,
      year: new Date().getFullYear(),
      status: "DRAFT",
      priceOnRequest: false,
      isFeatured: false,
      sortOrder: 0,
      variants: [],
      colors: [],
      images: [],
      specGroups: [],
      features: [],
      ...defaultValues,
    },
  });

  const variants = useFieldArray({ control: form.control, name: "variants" });
  const colors = useFieldArray({ control: form.control, name: "colors" });
  const images = useFieldArray({ control: form.control, name: "images" });
  const specGroups = useFieldArray({ control: form.control, name: "specGroups" });
  const features = useFieldArray({ control: form.control, name: "features" });

  function onSubmit(values: ModelInput) {
    startTransition(async () => {
      const action = values.id ? updateModel : createModel;
      const result = await action(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(values.id ? "Model updated" : "Model created");
      form.reset(values);
      router.push(`/admin/models/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <UnsavedChangesGuard dirty={form.formState.isDirty} />

      <div className="flex items-center justify-between">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="flex-wrap">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="variants">Variants ({variants.fields.length})</TabsTrigger>
            <TabsTrigger value="colors">Colors ({colors.fields.length})</TabsTrigger>
            <TabsTrigger value="gallery">Gallery ({images.fields.length})</TabsTrigger>
            <TabsTrigger value="specs">Specs</TabsTrigger>
            <TabsTrigger value="features">Features ({features.fields.length})</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Model code" error={form.formState.errors.name?.message}>
                <Input {...form.register("name")} placeholder="S07" />
              </Field>
              <Field label="Display name" error={form.formState.errors.displayName?.message}>
                <Input {...form.register("displayName")} placeholder="Soueast S07" />
              </Field>
            </div>
            <Field label="Tagline">
              <Input {...form.register("tagline")} placeholder="C-segment family SUV" />
            </Field>
            <Field label="Description" error={form.formState.errors.description?.message}>
              <Textarea rows={4} {...form.register("description")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Body type">
                <Controller
                  control={form.control}
                  name="bodyType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BODY_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label="Seats">
                <Input type="number" {...form.register("seats", { valueAsNumber: true })} />
              </Field>
              <Field label="Year">
                <Input type="number" {...form.register("year", { valueAsNumber: true })} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Starting price (USD)">
                <Input type="number" step="0.01" {...form.register("startingPriceUsd", { valueAsNumber: true })} />
              </Field>
              <div className="flex items-center gap-2 pt-6">
                <Controller
                  control={form.control}
                  name="priceOnRequest"
                  render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                />
                <Label>Price on request</Label>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Switch checked={field.value === "PUBLISHED"} onCheckedChange={(v) => field.onChange(v ? "PUBLISHED" : "DRAFT")} />
                  )}
                />
                <Label>Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Controller
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                />
                <Label>Featured on homepage</Label>
              </div>
            </div>
            <Field label="Hero image (16:9)">
              <Controller
                control={form.control}
                name="heroImageUrl"
                render={({ field }) => (
                  <ImageUploader folder="vehicles" value={field.value} onChange={field.onChange} aspectHint="16:9 exterior" />
                )}
              />
            </Field>
          </TabsContent>

          <TabsContent value="variants" className="space-y-3 pt-4">
            {variants.fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-6">
                <Input className="sm:col-span-2" placeholder="Variant name" {...form.register(`variants.${index}.name`)} />
                <Input placeholder="Price USD" type="number" {...form.register(`variants.${index}.priceUsd`, { valueAsNumber: true })} />
                <Input placeholder="Engine" {...form.register(`variants.${index}.engine`)} />
                <Input placeholder="HP" type="number" {...form.register(`variants.${index}.powerHp`, { valueAsNumber: true })} />
                <div className="flex gap-2">
                  <Controller
                    control={form.control}
                    name={`variants.${index}.fuelType`}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Fuel" /></SelectTrigger>
                        <SelectContent>{FUEL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => variants.remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Controller
                  control={form.control}
                  name={`variants.${index}.transmission`}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Transmission" /></SelectTrigger>
                      <SelectContent>{TRANSMISSIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`variants.${index}.drivetrain`}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Drivetrain" /></SelectTrigger>
                      <SelectContent>{DRIVETRAINS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                variants.append({
                  id: tempId(),
                  name: "",
                  fuelType: "PETROL",
                  transmission: "AUTOMATIC",
                  drivetrain: "FWD",
                  sortOrder: variants.fields.length,
                })
              }
            >
              <Plus className="h-4 w-4" /> Add variant
            </Button>
          </TabsContent>

          <TabsContent value="colors" className="space-y-3 pt-4">
            {colors.fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 rounded-lg border border-border p-3">
                <Input placeholder="Color name" {...form.register(`colors.${index}.name`)} />
                <div className="flex items-center gap-2">
                  <input type="color" className="h-9 w-9 rounded border border-border" {...form.register(`colors.${index}.hexCode`)} />
                  <Input placeholder="#RRGGBB" {...form.register(`colors.${index}.hexCode`)} />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => colors.remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => colors.append({ id: tempId(), name: "", hexCode: "#000000", sortOrder: colors.fields.length })}
            >
              <Plus className="h-4 w-4" /> Add color
            </Button>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-3 pt-4">
            <DragSortList
              items={images.fields.map((f, i) => ({ ...f, sortOrder: i }))}
              onReorder={(next) => form.setValue("images", next as ModelInput["images"], { shouldDirty: true })}
              renderItem={(field) => {
                const index = images.fields.findIndex((f) => f.id === field.id);
                return (
                  <div className="grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-start">
                    <Controller
                      control={form.control}
                      name={`images.${index}.url`}
                      render={({ field: f }) => (
                        <ImageUploader folder="vehicles" value={f.value} onChange={f.onChange} label="Upload" />
                      )}
                    />
                    <div className="space-y-2">
                      <Input placeholder="Alt text (required)" {...form.register(`images.${index}.alt`)} />
                      <Controller
                        control={form.control}
                        name={`images.${index}.category`}
                        render={({ field: f }) => (
                          <Select value={f.value} onValueChange={f.onChange}>
                            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="exterior">Exterior</SelectItem>
                              <SelectItem value="interior">Interior</SelectItem>
                              <SelectItem value="detail">Detail</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => images.remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => images.append({ id: tempId(), url: "", alt: "", category: "exterior", sortOrder: images.fields.length })}
            >
              <Plus className="h-4 w-4" /> Add image
            </Button>
          </TabsContent>

          <TabsContent value="specs" className="space-y-4 pt-4">
            {specGroups.fields.map((group, gIndex) => (
              <SpecGroupEditor key={group.id} control={form.control} register={form.register} groupIndex={gIndex} onRemoveGroup={() => specGroups.remove(gIndex)} />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => specGroups.append({ id: tempId(), title: "", sortOrder: specGroups.fields.length, specs: [] })}
            >
              <Plus className="h-4 w-4" /> Add spec group
            </Button>
          </TabsContent>

          <TabsContent value="features" className="space-y-3 pt-4">
            {features.fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[160px_1fr_auto]">
                <Controller
                  control={form.control}
                  name={`features.${index}.imageUrl`}
                  render={({ field: f }) => <ImageUploader folder="vehicles" value={f.value} onChange={f.onChange} label="Upload" />}
                />
                <div className="space-y-2">
                  <Input placeholder="Title" {...form.register(`features.${index}.title`)} />
                  <Textarea rows={2} placeholder="Description" {...form.register(`features.${index}.description`)} />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => features.remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => features.append({ id: tempId(), title: "", description: "", layout: "image-right", sortOrder: features.fields.length })}
            >
              <Plus className="h-4 w-4" /> Add feature
            </Button>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 pt-4">
            <Field label="Meta title">
              <Input {...form.register("metaTitle")} />
            </Field>
            <Field label="Meta description">
              <Textarea rows={3} {...form.register("metaDescription")} />
            </Field>
            <Field label="Slug (leave blank to auto-generate)">
              <Input {...form.register("slug")} placeholder="s07" />
            </Field>
          </TabsContent>
        </Tabs>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-background py-4">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {defaultValues?.id ? "Save changes" : "Create model"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  const id = useId();
  // Auto-associates the label with its control (WCAG 2.1 AA) for the common
  // case of a single Input/Textarea child; Controller-wrapped Select fields
  // render their own id via an explicit `id` prop instead (see call sites).
  const control = isValidElement<{ id?: string }>(children) ? cloneElement(children, { id }) : children;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {control}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SpecGroupEditor({ control, register, groupIndex, onRemoveGroup }: any) {
  const items = useFieldArray({ control, name: `specGroups.${groupIndex}.specs` });
  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex items-center gap-2">
        <Input placeholder="Group title (e.g. Engine & Performance)" {...register(`specGroups.${groupIndex}.title`)} />
        <Button type="button" variant="ghost" size="icon" onClick={onRemoveGroup}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2 ps-2">
        {items.fields.map((item: { id: string }, i: number) => (
          <div key={item.id} className="flex gap-2">
            <Input placeholder="Label" {...register(`specGroups.${groupIndex}.specs.${i}.label`)} />
            <Input placeholder="Value" {...register(`specGroups.${groupIndex}.specs.${i}.value`)} />
            <Input placeholder="Unit" className="w-24" {...register(`specGroups.${groupIndex}.specs.${i}.unit`)} />
            <Button type="button" variant="ghost" size="icon" onClick={() => items.remove(i)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => items.append({ id: tempId(), label: "", value: "", sortOrder: items.fields.length })}
        >
          <Plus className="h-4 w-4" /> Add row
        </Button>
      </div>
    </div>
  );
}
