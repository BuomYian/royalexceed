import { Resend } from "resend";

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
};

/**
 * Sends via Resend when RESEND_API_KEY is set; otherwise logs to the console
 * (dev transport) so the lead pipeline completes without a live key — see
 * README "Not verifiable in this sandbox" for the production Resend setup.
 *
 * Never throws: every caller treats this as a best-effort notification sent
 * *after* the actual lead/booking write already succeeded (see
 * lib/actions/{leads,test-drive,service-booking}.ts), none of them wrap the
 * call in a try/catch, and none inspect the return value. A delivery failure
 * — e.g. Resend's sandbox mode rejecting recipients other than the account
 * owner until a sending domain is verified — must not take down an
 * already-successful form submission with a full error page. Failures are
 * still logged server-side (and in the admin AuditLog via the caller) so
 * they're not silently lost, just non-fatal to the request.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const resend = getResend();
  const from = process.env.EMAIL_FROM ?? "Exceed Limited <onboarding@resend.dev>";

  if (!resend) {
    console.info(`[email:dev-transport] to=${JSON.stringify(to)} subject="${subject}"\n${html}`);
    return { id: "dev-transport", ok: true as const };
  }

  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error("[email] Resend send failed", error);
    return { id: null, ok: false as const, error };
  }
  return { ...data, ok: true as const };
}

export function leadNotificationEmail(params: {
  type: string;
  fullName: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  modelName?: string | null;
}) {
  return {
    subject: `New ${params.type} lead — ${params.fullName}`,
    html: `
      <h2>New ${params.type} enquiry</h2>
      <p><strong>Name:</strong> ${params.fullName}</p>
      <p><strong>Phone:</strong> ${params.phone}</p>
      ${params.email ? `<p><strong>Email:</strong> ${params.email}</p>` : ""}
      ${params.modelName ? `<p><strong>Model:</strong> ${params.modelName}</p>` : ""}
      ${params.message ? `<p><strong>Message:</strong> ${params.message}</p>` : ""}
    `,
  };
}

export function autoresponderEmail(params: { fullName: string; reference?: string }) {
  return {
    subject: "We've received your enquiry — Exceed Limited",
    html: `
      <p>Hi ${params.fullName},</p>
      <p>Thank you for contacting Exceed Limited, the sole authorized distributor of Soueast and 212 vehicles in South Sudan and Sudan.
      ${params.reference ? `Your reference number is <strong>${params.reference}</strong>.` : ""}
      Our team will be in touch shortly, or you can reach us directly on WhatsApp for a faster response.</p>
      <p>— Exceed Limited</p>
    `,
  };
}
