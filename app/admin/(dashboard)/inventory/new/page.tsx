import { requirePageAccess } from "@/lib/auth";
import { listModelOptions } from "@/lib/data/models";
import { InventoryForm } from "@/components/admin/inventory-form";

export const metadata = { title: "Add inventory unit" };

export default async function NewInventoryPage() {
  await requirePageAccess("inventory", "create");
  const models = await listModelOptions();
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Add inventory unit</h1>
      <InventoryForm models={models} />
    </div>
  );
}
