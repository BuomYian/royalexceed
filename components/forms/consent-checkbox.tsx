import { useTranslations } from "next-intl";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/i18n/navigation";

export function ConsentCheckbox<T extends FieldValues>({
  control,
  name,
}: {
  control: Control<T>;
  name: Path<T>;
}) {
  const t = useTranslations("testDrive");
  const tForms = useTranslations("forms");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-1.5">
          <label className="flex items-start gap-2.5 text-sm">
            <Checkbox
              checked={field.value ?? false}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              className="mt-0.5"
            />
            <span className="text-muted-foreground">
              {t("consent")} — <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
            </span>
          </label>
          {fieldState.error && <p className="text-sm text-destructive">{tForms("consentRequired")}</p>}
        </div>
      )}
    />
  );
}
