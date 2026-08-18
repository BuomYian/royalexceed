"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { articleInputSchema, type ArticleInput } from "@/lib/validations/article";
import { createArticle, updateArticle } from "@/lib/actions/news";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";

export function ArticleForm({ defaultValues }: { defaultValues?: Partial<ArticleInput> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tagInput, setTagInput] = useState("");

  const form = useForm({
    resolver: zodResolver(articleInputSchema),
    defaultValues: { title: "", body: "", tags: [] as string[], status: "DRAFT" as const, ...defaultValues },
  });

  const tags = form.watch("tags") ?? [];

  function addTag() {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) {
      form.setValue("tags", [...tags, value], { shouldDirty: true });
    }
    setTagInput("");
  }

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const action = values.id ? updateArticle : createArticle;
      const result = await action(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(values.id ? "Article updated" : "Article created");
      form.reset(values);
      router.push("/admin/news");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-4">
      <UnsavedChangesGuard dirty={form.formState.isDirty} />

      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input {...form.register("title")} />
        {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Excerpt</Label>
        <Textarea rows={2} {...form.register("excerpt")} />
      </div>

      <div className="space-y-1.5">
        <Label>Cover image (16:9)</Label>
        <Controller
          control={form.control}
          name="coverImageUrl"
          render={({ field }) => <ImageUploader folder="news" value={field.value} onChange={field.onChange} />}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Body</Label>
        <Controller
          control={form.control}
          name="body"
          render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
        />
        {form.formState.errors.body && <p className="text-sm text-destructive">{form.formState.errors.body.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button type="button" onClick={() => form.setValue("tags", tags.filter((t) => t !== tag), { shouldDirty: true })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag and press Enter"
          />
          <Button type="button" variant="outline" onClick={addTag}>Add</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
        <div className="space-y-1.5">
          <Label>Scheduled publish date (optional)</Label>
          <Input type="datetime-local" {...form.register("publishedAt")} />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {defaultValues?.id ? "Save changes" : "Create article"}
      </Button>
    </form>
  );
}
