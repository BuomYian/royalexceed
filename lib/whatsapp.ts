/** Normalizes any human-entered phone value into the digits-only format wa.me requires. */
export function normalizeWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** Builds a wa.me deep link with a prefilled, URL-encoded message. */
export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = normalizeWhatsAppNumber(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function modelEnquiryMessage(modelDisplayName: string): string {
  return `Hello Royal Exceed Co. Ltd, I'm interested in the ${modelDisplayName}`;
}

export function inventoryEnquiryMessage(
  modelDisplayName: string,
  stockNumber: string,
): string {
  return `Hello Royal Exceed Co. Ltd, I'm interested in the ${modelDisplayName} (Stock #${stockNumber})`;
}
