"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function WhatsAppButton({
  phone,
  message,
  className,
}: {
  phone: string;
  message: string;
  className?: string;
}) {
  return (
    <a
      href={buildWhatsAppLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={cn(
        "fixed bottom-5 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
        className,
      )}
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" strokeWidth={0} aria-hidden="true" />
    </a>
  );
}
