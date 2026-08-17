import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink, modelEnquiryMessage } from "@/lib/whatsapp";

export function WhatsAppEnquireButton({
  modelDisplayName,
  whatsappNumber,
  className,
}: {
  modelDisplayName: string;
  whatsappNumber: string;
  className?: string;
}) {
  const t = useTranslations("common");

  return (
    <Button
      variant="outline"
      className={className ?? "w-full border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10"}
      render={
        <a
          href={buildWhatsAppLink(whatsappNumber, modelEnquiryMessage(modelDisplayName))}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="h-4 w-4" /> {t("whatsapp")}
        </a>
      }
    />
  );
}
