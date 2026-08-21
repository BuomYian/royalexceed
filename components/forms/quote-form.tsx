"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2 } from "lucide-react";
import { quoteLeadSchema } from "@/lib/validations/lead";
import { submitQuoteLead } from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Honeypot } from "@/components/forms/honeypot";
import { ConsentCheckbox } from "@/components/forms/consent-checkbox";
import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import { Card, CardContent } from "@/components/ui/card";

/**
 * The model detail page's "Request Quote" button has always linked to
 * `#quote` — but nothing on the page had that id, so clicking it did
 * nothing. `submitQuoteLead`/`quoteLeadSchema` (lib/actions/leads.ts,
 * lib/validations/lead.ts) were already fully built server-side; only this
 * form was ever missing.
 */
export function QuoteForm({ modelId }: { modelId: string }) {
  const t = useTranslations("modelDetail");
  const tForms = useTranslations("forms");
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(quoteLeadSchema),
    defaultValues: { fullName: "", phone: "", email: "", message: "", modelId, honeypot: "", pageUrl: pathname },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitQuoteLead({ ...values, pageUrl: pathname, source: "model-detail" });
      if (!result.success) {
        setServerError(tForms("submitError"));
        return;
      }
      setDone(true);
    });
  });

  if (done) {
    return (
      <Card>
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
        <Label>{t("quoteFullName")}</Label>
        <Input {...form.register("fullName")} autoComplete="name" />
        {form.formState.errors.fullName && <p className="text-sm text-destructive">{tForms("requiredField")}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t("quotePhone")}</Label>
          <Input {...form.register("phone")} type="tel" autoComplete="tel" />
          {form.formState.errors.phone && <p className="text-sm text-destructive">{tForms("invalidPhone")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>{t("quoteEmail")}</Label>
          <Input {...form.register("email")} type="email" autoComplete="email" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>{t("quoteMessage")}</Label>
        <Textarea rows={3} {...form.register("message")} />
      </div>

      <ConsentCheckbox control={form.control} name="consent" />
      <TurnstileWidget onToken={(token) => form.setValue("turnstileToken", token)} />

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("quoteSubmit")}
      </Button>
    </form>
  );
}
