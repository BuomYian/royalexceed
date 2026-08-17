import type { UseFormRegisterReturn } from "react-hook-form";

/** Hidden field bots fill in but humans never see — a non-empty value flags the submission as spam (spec §9/§10). */
export function Honeypot({ register }: { register: UseFormRegisterReturn }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
      <label>
        Company website
        <input type="text" tabIndex={-1} autoComplete="off" {...register} />
      </label>
    </div>
  );
}
