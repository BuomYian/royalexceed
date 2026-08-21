"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2 } from "lucide-react";
import { quoteLeadSchema, type QuoteLeadInput } from "@/lib/validations/lead";
import { submitQuoteLead } from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Honeypot } from "@/components/forms/honeypot";
import { ConsentCheckbox } from "@/components/forms/consent-checkbox";
import { TurnstileWidget, TURNSTILE_ENABLED } from "@/components/forms/turnstile-widget";
import { Card, CardContent } from "@/components/ui/card";

const TIMELINE_OPTIONS = ["IMMEDIATELY", "WITHIN_1_MONTH", "ONE_TO_THREE_MONTHS", "RESEARCHING"] as const;
const CONTACT_OPTIONS = ["PHONE", "WHATSAPP", "EMAIL"] as const;

/**
 * The model detail page's "Request Quote" button has always linked to
 * `#quote` — but nothing on the page had that id, so clicking it did
 * nothing. `submitQuoteLead`/`quoteLeadSchema` (lib/actions/leads.ts,
 * lib/validations/lead.ts) were already fully built server-side; only this
 * form was ever missing.
 *
 * Fields beyond name/phone/email are optional detail — variant, color,
 * quantity, timeline, trade-in, financing interest, preferred contact
 * method, location — so sales knows what the client actually wants before
 * the first call, instead of just "someone asked about this model".
 */
export function QuoteForm({
  modelId,
  variants,
  colors,
}: {
  modelId: string;
  variants: { id: string; name: string }[];
  colors: { id: string; name: string }[];
}) {
  const t = useTranslations("modelDetail");
  const tForms = useTranslations("forms");
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // Gates Submit so it can't fire before Turnstile has a real token — see
  // turnstile-widget.tsx for why a fixed timer would just reintroduce the bug.
  const [turnstileReady, setTurnstileReady] = useState(!TURNSTILE_ENABLED);

  const form = useForm({
    resolver: zodResolver(quoteLeadSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      modelId,
      // Empty-string starting values (not `undefined`) keep the Selects
      // controlled from the first render — Base UI warns otherwise.
      variantName: "" as unknown as QuoteLeadInput["variantName"],
      colorName: "" as unknown as QuoteLeadInput["colorName"],
      quantity: 1,
      timeline: "" as unknown as QuoteLeadInput["timeline"],
      hasTradeIn: false,
      wantsFinancing: false,
      preferredContact: "" as unknown as QuoteLeadInput["preferredContact"],
      city: "",
      message: "",
      honeypot: "",
      pageUrl: pathname,
    },
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

      {(variants.length > 0 || colors.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {variants.length > 0 && (
            <div className="space-y-1.5">
              <Label>{t("quoteVariant")}</Label>
              <Select
                value={form.watch("variantName") ?? ""}
                onValueChange={(v) => form.setValue("variantName", v ?? "")}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder={t("quoteAnyVariant")} /></SelectTrigger>
                <SelectContent>
                  {variants.map((v) => <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {colors.length > 0 && (
            <div className="space-y-1.5">
              <Label>{t("quoteColor")}</Label>
              <Select
                value={form.watch("colorName") ?? ""}
                onValueChange={(v) => form.setValue("colorName", v ?? "")}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder={t("quoteAnyColor")} /></SelectTrigger>
                <SelectContent>
                  {colors.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t("quoteQuantity")}</Label>
          <Input type="number" min={1} max={999} {...form.register("quantity", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("quoteTimelineLabel")}</Label>
          <Select
            value={form.watch("timeline") ?? ""}
            onValueChange={(v) => form.setValue("timeline", (v ?? "") as QuoteLeadInput["timeline"])}
          >
            <SelectTrigger className="w-full"><SelectValue placeholder={t("quoteTimelinePlaceholder")} /></SelectTrigger>
            <SelectContent>
              {TIMELINE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>{t(`quoteTimelineOptions.${opt}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t("quoteCity")}</Label>
          <Input {...form.register("city")} placeholder={t("quoteCityPlaceholder")} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("quotePreferredContactLabel")}</Label>
          <Select
            value={form.watch("preferredContact") ?? ""}
            onValueChange={(v) => form.setValue("preferredContact", (v ?? "") as QuoteLeadInput["preferredContact"])}
          >
            <SelectTrigger className="w-full"><SelectValue placeholder={t("quotePreferredContactPlaceholder")} /></SelectTrigger>
            <SelectContent>
              {CONTACT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>{t(`quotePreferredContactOptions.${opt}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
        <Controller
          control={form.control}
          name="hasTradeIn"
          render={({ field }) => (
            <label className="flex items-center gap-2.5 text-sm">
              <Checkbox checked={field.value ?? false} onCheckedChange={(checked) => field.onChange(checked === true)} />
              <span className="text-muted-foreground">{t("quoteHasTradeIn")}</span>
            </label>
          )}
        />
        <Controller
          control={form.control}
          name="wantsFinancing"
          render={({ field }) => (
            <label className="flex items-center gap-2.5 text-sm">
              <Checkbox checked={field.value ?? false} onCheckedChange={(checked) => field.onChange(checked === true)} />
              <span className="text-muted-foreground">{t("quoteWantsFinancing")}</span>
            </label>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t("quoteMessage")}</Label>
        <Textarea rows={3} {...form.register("message")} />
      </div>

      <ConsentCheckbox control={form.control} name="consent" />
      <TurnstileWidget onToken={(token) => form.setValue("turnstileToken", token)} onReady={setTurnstileReady} />

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={pending || !turnstileReady}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("quoteSubmit")}
      </Button>
    </form>
  );
}
