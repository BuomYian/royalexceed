import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Sign in" };

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  const { next } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground font-heading font-bold">
            FBM
          </div>
          <h1 className="font-heading text-xl font-bold">Admin sign in</h1>
          <p className="text-sm text-muted-foreground">FBM International dashboard</p>
        </div>
        <LoginForm next={typeof next === "string" ? next : undefined} />
      </div>
    </div>
  );
}
