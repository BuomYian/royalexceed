import { requirePageAccess } from "@/lib/auth";
import { ModelForm } from "@/components/admin/model-form";

export const metadata = { title: "New model" };

export default async function NewModelPage() {
  await requirePageAccess("models", "create");
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">New model</h1>
      <ModelForm />
    </div>
  );
}
