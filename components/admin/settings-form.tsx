"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateSiteSettingsSchema, type UpdateSiteSettingsInput } from "@/lib/validations/settings";
import { updateSiteSettings } from "@/lib/actions/settings";
import type { ResolvedSiteSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";

export function SettingsForm({ defaultValues }: { defaultValues: ResolvedSiteSettings }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<UpdateSiteSettingsInput>({
    resolver: zodResolver(updateSiteSettingsSchema),
    defaultValues,
  });

  function onSubmit(values: UpdateSiteSettingsInput) {
    startTransition(async () => {
      const result = await updateSiteSettings(values);
      if (!result.success) toast.error(result.error);
      else {
        toast.success("Settings saved");
        form.reset(values);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <UnsavedChangesGuard dirty={form.formState.isDirty} />

      <Card>
        <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Phone</Label><Input {...form.register("phone")} /></div>
          <div className="space-y-1.5"><Label>WhatsApp number (digits only, intl format)</Label><Input {...form.register("whatsappNumber")} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input {...form.register("email")} /></div>
          <div className="space-y-1.5"><Label>USD → SSP rate</Label><Input type="number" step="0.0001" {...form.register("usdToSsp", { valueAsNumber: true })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Address</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Address line</Label><Input {...form.register("address.line")} /></div>
          <div className="space-y-1.5"><Label>City</Label><Input {...form.register("address.city")} /></div>
          <div className="space-y-1.5"><Label>Country</Label><Input {...form.register("address.country")} /></div>
          <div className="space-y-1.5"><Label>Latitude</Label><Input type="number" step="0.0001" {...form.register("address.lat", { valueAsNumber: true })} /></div>
          <div className="space-y-1.5"><Label>Longitude</Label><Input type="number" step="0.0001" {...form.register("address.lng", { valueAsNumber: true })} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Map URL</Label><Input {...form.register("address.mapUrl")} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Opening hours</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5"><Label>Mon–Fri</Label><Input {...form.register("hours.monFri")} /></div>
          <div className="space-y-1.5"><Label>Saturday</Label><Input {...form.register("hours.saturday")} /></div>
          <div className="space-y-1.5"><Label>Sunday</Label><Input {...form.register("hours.sunday")} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Socials</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Facebook</Label><Input {...form.register("socials.facebook")} /></div>
          <div className="space-y-1.5"><Label>Instagram</Label><Input {...form.register("socials.instagram")} /></div>
          <div className="space-y-1.5"><Label>TikTok</Label><Input {...form.register("socials.tiktok")} /></div>
          <div className="space-y-1.5"><Label>X (Twitter)</Label><Input {...form.register("socials.x")} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">SEO defaults</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-1.5"><Label>Default title</Label><Input {...form.register("seoDefaults.title")} /></div>
          <div className="space-y-1.5"><Label>Default description</Label><Input {...form.register("seoDefaults.description")} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Maintenance mode</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-3">
          <Switch checked={form.watch("maintenanceMode")} onCheckedChange={(v) => form.setValue("maintenanceMode", v, { shouldDirty: true })} />
          <Label>Show a maintenance holding page to visitors</Label>
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save settings
      </Button>
    </form>
  );
}
