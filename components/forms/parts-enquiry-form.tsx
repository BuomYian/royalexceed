"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2 } from "lucide-react";
import { partsLeadSchema } from "@/lib/validations/lead";
import { submitPartsLead } from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Honeypot } from "@/components/forms/honeypot";
import { ConsentCheckbox } from "@/components/forms/consent-checkbox";
import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import { Card, CardContent } from "@/components/ui/card";

export function PartsEnquiryForm() {
  const t = useTranslations("parts");
  const tForms = useTranslations("forms");
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(partsLeadSchema),
    defaultValues: { fullName: "", phone: "", email: "", partName: "", quantity: 1, honeypot: "", pageUrl: pathname },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitPartsLead({ ...values, pageUrl: pathname });
      if (!result.success) {
        setServerError(tForms("submitError"));
        return;
      }
      setDone(true);
    });
  });

  if (done) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <CheckCircle2 className="h-12 w-12 text-success" />
          <p className="text-muted-foreground">{tForms("submitSuccess")}</p>
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

      <div className="space-y-1.5">
        <Label>{t("partName")}</Label>
        <Input {...form.register("partName")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>{t("partNumber")}</Label>
          <Input {...form.register("partNumber")} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("vin")}</Label>
          <Input {...form.register("vin")} maxLength={17} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("quantity")}</Label>
          <Input type="number" min={1} {...form.register("quantity", { valueAsNumber: true })} />
        </div>
      </div>

      <ConsentCheckbox control={form.control} name="consent" />
      <TurnstileWidget onToken={(token) => form.setValue("turnstileToken", token)} />

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Send enquiry
      </Button>
    </form>
  );
}
