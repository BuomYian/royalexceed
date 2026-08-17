"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2 } from "lucide-react";
import { financeLeadSchema, type FinanceLeadInput } from "@/lib/validations/lead";
import { submitFinanceLead } from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Honeypot } from "@/components/forms/honeypot";
import { ConsentCheckbox } from "@/components/forms/consent-checkbox";
import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import { Card, CardContent } from "@/components/ui/card";

export function FinanceEnquiryForm() {
  const tForms = useTranslations("forms");
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FinanceLeadInput>({
    resolver: zodResolver(financeLeadSchema),
    defaultValues: { fullName: "", phone: "", email: "", message: "", isFleetEnquiry: false, honeypot: "", pageUrl: pathname },
  });

  function onSubmit(values: FinanceLeadInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await submitFinanceLead({ ...values, pageUrl: pathname });
      if (!result.success) {
        setServerError(tForms("submitError"));
        return;
      }
      setDone(true);
    });
  }

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
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-lg space-y-4">
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
        <Label>Message</Label>
        <Textarea rows={3} {...form.register("message")} placeholder="Tell us about the vehicle(s) and quantity you need" />
      </div>

      <label className="flex items-center gap-2.5 text-sm">
        <Switch checked={form.watch("isFleetEnquiry")} onCheckedChange={(v) => form.setValue("isFleetEnquiry", v)} />
        This is a fleet / corporate enquiry
      </label>

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
