import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container-brand py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "Privacy Policy", url: "/privacy" }]} />
      <div className="prose prose-neutral dark:prose-invert mx-auto mt-6 max-w-3xl">
        <h1>Privacy Policy</h1>
        <p>Last updated: August 2026</p>

        <h2>What we collect</h2>
        <p>
          When you submit a form on this site (test drive booking, service booking, quote request, or general
          enquiry), we collect your name, phone number, and — where provided — your email address, along with the
          details of your enquiry (e.g. preferred model, vehicle information, or message).
        </p>

        <h2>How we use it</h2>
        <p>
          We use this information solely to respond to your enquiry, schedule bookings, and provide sales, service,
          and parts support. We do not sell your personal data to third parties.
        </p>

        <h2>How we store it</h2>
        <p>
          Your information is stored securely in our database, hosted on Supabase infrastructure, and is only
          accessible to authorized Exceed Limited staff.
        </p>

        <h2>Your rights</h2>
        <p>
          You may request deletion of your personal data at any time by contacting us at{" "}
          <a href={`mailto:${settings.email}`}>{settings.email}</a> or {settings.phone}. Our staff can also delete a
          lead record directly from the admin system upon request.
        </p>

        <h2>Cookies</h2>
        <p>
          This site uses essential cookies for authentication (admin dashboard only) and, where enabled, analytics
          cookies to understand site usage. You can control cookies through your browser settings.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy can be directed to Exceed Limited at {settings.address.line},{" "}
          {settings.address.city}, {settings.address.country}, or via {settings.email}.
        </p>
      </div>
    </div>
  );
}
