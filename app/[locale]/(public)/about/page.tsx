import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Building2, HeartHandshake, Users } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("title"), alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const settings = await getSiteSettings();

  return (
    <div className="container-brand py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: t("title"), url: "/about" }]} />

      <div className="mx-auto mt-4 max-w-3xl">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">{t("title")}</h1>

        <section className="mt-10">
          <h2 className="font-heading text-2xl font-bold">{t("storyTitle")}</h2>
          <p className="mt-3 text-muted-foreground">
            Royal Exceed Co. Ltd was founded to bring reliable, genuine, factory-backed vehicles to South Sudan and Sudan.
            From our showroom in Juba Town, near Muduria Roundabout, we serve individual buyers, NGOs,
            government agencies, and corporate fleets across both countries.
          </p>
        </section>

        <section className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <div className="flex items-start gap-3">
            {/* Solid white background in the source file — a white tile keeps it
                legible rather than a raw white square dropped on the tinted card. */}
            <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white p-1">
              <Image src="/fbm_international_co_logo.jpg" alt="FBM International Co." width={40} height={40} className="h-full w-full object-contain" />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-bold">{t("partnershipTitle")}</h2>
              <p className="mt-3 text-muted-foreground">
                Royal Exceed Co. Ltd is the <strong className="text-foreground">sole authorized distributor of Soueast and 212 vehicles in South Sudan and Sudan</strong>,
                operating in partnership with FBM International Co., our principal in-market partner.
                This means every vehicle we sell is factory-genuine, every part is sourced directly from the
                manufacturer, and our technicians are factory-trained — a level of assurance no unauthorized
                reseller can match.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-start gap-3">
            <Users className="mt-1 h-7 w-7 shrink-0 text-primary" />
            <div>
              <h2 className="font-heading text-2xl font-bold">{t("leadershipTitle")}</h2>
              <p className="mt-3 text-muted-foreground">
                Our leadership team brings decades of combined experience in automotive sales, fleet management,
                and after-sales service across East Africa.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-start gap-3">
            <Building2 className="mt-1 h-7 w-7 shrink-0 text-primary" />
            <div>
              <h2 className="font-heading text-2xl font-bold">{t("facilitiesTitle")}</h2>
              <p className="mt-3 text-muted-foreground">
                Our {settings.address.line} facility includes a full showroom, genuine parts store, and a dedicated
                service workshop staffed by factory-trained technicians.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 mb-10">
          <div className="flex items-start gap-3">
            <HeartHandshake className="mt-1 h-7 w-7 shrink-0 text-primary" />
            <div>
              <h2 className="font-heading text-2xl font-bold">{t("csrTitle")}</h2>
              <p className="mt-3 text-muted-foreground">
                Royal Exceed Co. Ltd is committed to supporting local communities in Juba through employment,
                technician training programs, and partnerships with local organizations.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
