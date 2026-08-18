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
 */
export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const resend = getResend();
  const from = process.env.EMAIL_FROM ?? "Exceed Limited <onboarding@resend.dev>";

  if (!resend) {
    console.info(`[email:dev-transport] to=${JSON.stringify(to)} subject="${subject}"\n${html}`);
    return { id: "dev-transport" };
  }

  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error("[email] Resend send failed", error);
    throw new Error("Failed to send email");
  }
  return data;
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
