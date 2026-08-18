import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/terms" } };

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container-brand py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "Terms of Service", url: "/terms" }]} />
      <div className="prose prose-neutral dark:prose-invert mx-auto mt-6 max-w-3xl">
        <h1>Terms of Service</h1>
        <p>Last updated: August 2026</p>

        <h2>About Exceed Limited</h2>
        <p>
          Exceed Limited, in partnership with FBM International Co., is the sole authorized distributor of Soueast
          and 212 vehicles in South Sudan and Sudan, operating a showroom and service center at{" "}
          {settings.address.line}, {settings.address.city}, {settings.address.country}.
        </p>

        <h2>Website use</h2>
        <p>
          This website provides information about our vehicle range, inventory, and services. All prices are shown
          in US Dollars (USD) and are indicative, subject to confirmation at the time of purchase.
        </p>

        <h2>No online purchase</h2>
        <p>
          This website does not process payments or complete vehicle sales online. All bookings and enquiries
          submitted through this site (test drives, service appointments, quote requests) are confirmed directly by
          our sales or service team by phone, WhatsApp, or email.
        </p>

        <h2>Warranty and genuine parts</h2>
        <p>
          All new vehicles sold by Exceed Limited carry the manufacturer warranty described on the relevant
          model page. Warranty coverage is contingent on the use of genuine Soueast or 212 parts and service
          performed by an authorized Exceed Limited technician.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          Vehicle specifications, imagery, and availability on this site are provided for general information and
          may change without notice. Please confirm final specification, pricing, and availability with our sales
          team before making a purchase decision.
        </p>

        <h2>Contact</h2>
        <p>
          For questions about these terms, contact Exceed Limited at {settings.email} or {settings.phone}.
        </p>
      </div>
    </div>
  );
}
