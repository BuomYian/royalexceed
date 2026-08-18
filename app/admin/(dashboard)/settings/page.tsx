import { requirePageAccess } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Site Settings" };

export default async function AdminSettingsPage() {
  await requirePageAccess("settings", "read");
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold">Site Settings</h1>
        <p className="text-sm text-muted-foreground">
          Contact details, hours, socials, and SEO defaults used across the public site.
        </p>
      </div>
      <SettingsForm defaultValues={settings} />
    </div>
  );
}
