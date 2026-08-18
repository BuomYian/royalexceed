"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2 } from "lucide-react";
import { testDriveBookingSchema, TIME_SLOTS, type TestDriveBookingInput } from "@/lib/validations/test-drive";
import { submitTestDriveBooking } from "@/lib/actions/test-drive";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Honeypot } from "@/components/forms/honeypot";
import { ConsentCheckbox } from "@/components/forms/consent-checkbox";
import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { Card, CardContent } from "@/components/ui/card";

export function TestDriveForm({
  models,
  whatsappNumber,
}: {
  models: { id: string; displayName: string }[];
  whatsappNumber: string;
}) {
  const t = useTranslations("testDrive");
  const tForms = useTranslations("forms");
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [reference, setReference] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(testDriveBookingSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      // Explicit empty-string starting values (not `undefined`) so the Select
      // components stay controlled from the first render — Base UI warns
      // when a Select flips from uncontrolled to controlled.
      modelId: "" as unknown as TestDriveBookingInput["modelId"],
      timeSlot: "" as unknown as TestDriveBookingInput["timeSlot"],
      notes: "",
      location: "Showroom - Juba Town",
      honeypot: "",
      pageUrl: pathname,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitTestDriveBooking({ ...values, pageUrl: pathname });
      if (!result.success) {
        if (result.error === "forms.slotTaken") setServerError(t("slotTaken"));
        else setServerError(tForms("submitError"));
        return;
      }
      setReference(result.data.reference);
    });
  });

  if (reference) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <CheckCircle2 className="h-12 w-12 text-success" />
          <h2 className="font-heading text-2xl font-bold">{t("confirmedTitle")}</h2>
          <p className="text-muted-foreground">{t("confirmedBody", { reference })}</p>
          <Button
            render={
              <a href={buildWhatsAppLink(whatsappNumber, `Hi, I just booked a test drive — reference ${reference}.`)} target="_blank" rel="noopener noreferrer">
                Confirm on WhatsApp
              </a>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-4">
      <Honeypot register={form.register("honeypot")} />

      <div className="space-y-1.5">
        <Label htmlFor="td-fullName">{t("fullName")}</Label>
        <Input id="td-fullName" {...form.register("fullName")} autoComplete="name" />
        {form.formState.errors.fullName && <p className="text-sm text-destructive">{tForms("requiredField")}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="td-phone">{t("phone")}</Label>
          <Input id="td-phone" {...form.register("phone")} type="tel" placeholder="+211 92 000 0000" autoComplete="tel" />
          {form.formState.errors.phone && <p className="text-sm text-destructive">{tForms("invalidPhone")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="td-email">{t("email")}</Label>
          <Input id="td-email" {...form.register("email")} type="email" autoComplete="email" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="td-model">{t("model")}</Label>
        <Select value={form.watch("modelId")} onValueChange={(v) => form.setValue("modelId", v ?? "", { shouldValidate: true })}>
          <SelectTrigger id="td-model" className="w-full"><SelectValue placeholder={t("model")} /></SelectTrigger>
          <SelectContent>
            {models.map((m) => <SelectItem key={m.id} value={m.id}>{m.displayName}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="td-date">{t("date")}</Label>
          <Input id="td-date" type="date" min={new Date().toISOString().slice(0, 10)} {...form.register("preferredDate")} />
          {form.formState.errors.preferredDate && <p className="text-sm text-destructive">{tForms("requiredField")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="td-timeSlot">{t("timeSlot")}</Label>
          <Select value={form.watch("timeSlot")} onValueChange={(v) => form.setValue("timeSlot", v as (typeof TIME_SLOTS)[number], { shouldValidate: true })}>
            <SelectTrigger id="td-timeSlot" className="w-full"><SelectValue placeholder={t("timeSlot")} /></SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((slot) => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="td-location">{t("location")}</Label>
        <Select value={form.watch("location")} onValueChange={(v) => form.setValue("location", v as "Showroom - Juba Town" | "Office visit")}>
          <SelectTrigger id="td-location" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Showroom - Juba Town">{t("showroom")}</SelectItem>
            <SelectItem value="Office visit">{t("officeVisit")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="td-notes">{t("notes")}</Label>
        <Textarea id="td-notes" rows={3} {...form.register("notes")} />
      </div>

      <ConsentCheckbox control={form.control} name="consent" />
      <TurnstileWidget onToken={(token) => form.setValue("turnstileToken", token)} />

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("submit")}
      </Button>
    </form>
  );
}
