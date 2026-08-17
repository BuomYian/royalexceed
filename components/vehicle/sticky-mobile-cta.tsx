"use client";

import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink, modelEnquiryMessage } from "@/lib/whatsapp";

/** Sticky mobile-only CTA bar per spec §6 model-detail page: Book Test Drive | Request Quote | WhatsApp. */
export function StickyMobileCta({
  modelSlug,
  modelDisplayName,
  whatsappNumber,
}: {
  modelSlug: string;
  modelDisplayName: string;
  whatsappNumber: string;
}) {
  const t = useTranslations("common");

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
      <Button className="flex-1" size="sm" render={<Link href="/test-drive">{t("bookTestDrive")}</Link>} />
      <Button
        className="flex-1"
        size="sm"
        variant="outline"
        render={<Link href={`/models/${modelSlug}#quote`}>{t("requestQuote")}</Link>}
      />
      <Button
        size="icon"
        variant="outline"
        className="shrink-0 border-[#25D366]/40 text-[#25D366]"
        render={
          <a
            href={buildWhatsAppLink(whatsappNumber, modelEnquiryMessage(modelDisplayName))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("whatsapp")}
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        }
      />
    </div>
  );
}
