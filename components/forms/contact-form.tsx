"use client";

import { useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2 } from "lucide-react";
import { generalLeadSchema, type GeneralLeadInput } from "@/lib/validations/lead";
import { submitGeneralLead } from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Honeypot } from "@/components/forms/honeypot";
import { ConsentCheckbox } from "@/components/forms/consent-checkbox";
import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import { Card, CardContent } from "@/components/ui/card";

export function ContactForm() {
  const t = useTranslations("contact");
  const tForms = useTranslations("forms");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const initialDept = (searchParams.get("department") as GeneralLeadInput["department"]) || "general";

  const form = useForm({
    resolver: zodResolver(generalLeadSchema),
    defaultValues: { fullName: "", phone: "", email: "", message: "", department: initialDept, honeypot: "", pageUrl: pathname },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitGeneralLead({ ...values, pageUrl: pathname, source: `contact-${values.department}` });
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
        <Label>{t("department")}</Label>
        <Select value={form.watch("department")} onValueChange={(v) => form.setValue("department", v as GeneralLeadInput["department"])}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="general">{t("generalEnquiry")}</SelectItem>
            <SelectItem value="sales">{t("salesDept")}</SelectItem>
            <SelectItem value="service">{t("serviceDept")}</SelectItem>
            <SelectItem value="parts">{t("partsDept")}</SelectItem>
            <SelectItem value="fleet">{t("fleetDept")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>{t("fullName")}</Label>
        <Input {...form.register("fullName")} autoComplete="name" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t("phone")}</Label>
          <Input {...form.register("phone")} type="tel" autoComplete="tel" />
          {form.formState.errors.phone && <p className="text-sm text-destructive">{tForms("invalidPhone")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>{t("email")}</Label>
          <Input {...form.register("email")} type="email" autoComplete="email" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>{t("message")}</Label>
        <Textarea rows={4} {...form.register("message")} />
        {form.formState.errors.message && <p className="text-sm text-destructive">{tForms("requiredField")}</p>}
      </div>

      <ConsentCheckbox control={form.control} name="consent" />
      <TurnstileWidget onToken={(token) => form.setValue("turnstileToken", token)} />

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Send message
      </Button>
    </form>
  );
}
