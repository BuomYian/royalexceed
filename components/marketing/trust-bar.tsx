import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";

export function TrustBar() {
  const t = useTranslations("home");
  return (
    <div className="border-y border-border/60 bg-primary/5">
      <div className="container-brand flex items-center justify-center gap-2 py-3 text-center text-sm font-medium sm:text-base">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
        {t("trustBar")}
      </div>
    </div>
  );
}
