import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "../globals.css";

const interTight = Inter_Tight({
  variable: "--font-heading-family",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});
const inter = Inter({ variable: "--font-sans-family", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Admin | FBM International", template: "%s | FBM Admin" },
  description: "FBM International admin dashboard.",
  robots: { index: false, follow: false },
};

// Root layout for the entire /admin tree (multiple-root-layouts pattern — see
// app/[locale]/layout.tsx for the public-site counterpart). Deliberately light
// theme (no "dark" class) and no sidebar chrome here: the authenticated shell
// with sidebar/topbar lives in app/admin/(dashboard)/layout.tsx so the login
// page can render standalone.
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={`${interTight.variable} ${inter.variable} h-full antialiased`}
      style={
        {
          "--font-heading": "var(--font-heading-family)",
          "--font-sans": "var(--font-sans-family)",
        } as React.CSSProperties
      }
    >
      <body className="min-h-full bg-background text-foreground">
        <TooltipProvider delayDuration={150}>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
