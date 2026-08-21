"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2 } from "lucide-react";
import { serviceBookingSchema, SERVICE_TYPES, type ServiceBookingInput } from "@/lib/validations/service-booking";
import { submitServiceBooking } from "@/lib/actions/service-booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Honeypot } from "@/components/forms/honeypot";
import { ConsentCheckbox } from "@/components/forms/consent-checkbox";
import { TurnstileWidget, TURNSTILE_ENABLED } from "@/components/forms/turnstile-widget";
import { Card, CardContent } from "@/components/ui/card";

export function ServiceBookingForm() {
  const t = useTranslations("services");
  const tForms = useTranslations("forms");
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [reference, setReference] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  // Gates Submit so it can't fire before Turnstile has a real token — see
  // turnstile-widget.tsx for why a fixed timer would just reintroduce the bug.
  const [turnstileReady, setTurnstileReady] = useState(!TURNSTILE_ENABLED);

  const form = useForm({
    resolver: zodResolver(serviceBookingSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      vehicleModel: "",
      // Empty-string starting value (not `undefined`) keeps the Select controlled from the first render.
      serviceType: "" as unknown as ServiceBookingInput["serviceType"],
      description: "",
      honeypot: "",
      pageUrl: pathname,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitServiceBooking({ ...values, pageUrl: pathname });
      if (!result.success) {
        setServerError(tForms("submitError"));
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
          <h2 className="font-heading text-2xl font-bold">Service booked!</h2>
          <p className="text-muted-foreground">Your reference number is {reference}. Our workshop team will confirm shortly.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-4">
      <Honeypot register={form.register("honeypot")} />

      <div className="space-y-1.5">
        <Label>Full name</Label>
        <Input {...form.register("fullName")} autoComplete="name" />
        {form.formState.errors.fullName && <p className="text-sm text-destructive">{tForms("requiredField")}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Phone number</Label>
          <Input {...form.register("phone")} type="tel" autoComplete="tel" />
          {form.formState.errors.phone && <p className="text-sm text-destructive">{tForms("invalidPhone")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Email (optional)</Label>
          <Input {...form.register("email")} type="email" autoComplete="email" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t("vehicleModel")}</Label>
          <Input {...form.register("vehicleModel")} placeholder="Soueast S07" />
        </div>
        <div className="space-y-1.5">
          <Label>{t("serviceType")}</Label>
          <Select value={form.watch("serviceType")} onValueChange={(v) => form.setValue("serviceType", v as (typeof SERVICE_TYPES)[number], { shouldValidate: true })}>
            <SelectTrigger className="w-full"><SelectValue placeholder={t("serviceType")} /></SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>{t("plateNumber")}</Label>
          <Input {...form.register("plateNumber")} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("vin")}</Label>
          <Input {...form.register("vin")} maxLength={17} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("mileage")}</Label>
          <Input type="number" {...form.register("mileageKm", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>{t("date")}</Label>
        <Input type="date" min={new Date().toISOString().slice(0, 10)} {...form.register("preferredDate")} />
      </div>

      <div className="space-y-1.5">
        <Label>{t("description")}</Label>
        <Textarea rows={3} {...form.register("description")} />
      </div>

      <ConsentCheckbox control={form.control} name="consent" />
      <TurnstileWidget onToken={(token) => form.setValue("turnstileToken", token)} onReady={setTurnstileReady} />

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={pending || !turnstileReady}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Book service
      </Button>
    </form>
  );
}
