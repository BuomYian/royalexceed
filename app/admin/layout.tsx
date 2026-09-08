import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import "../globals.css";

const interTight = Inter_Tight({
  variable: "--font-heading-family",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});
const inter = Inter({ variable: "--font-sans-family", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Admin | Royal Exceed Co. Ltd", template: "%s | Royal Exceed Co. Ltd Admin" },
  description: "Royal Exceed Co. Ltd admin dashboard.",
  robots: { index: false, follow: false },
};

// Root layout for the entire /admin tree (multiple-root-layouts pattern — see
// app/[locale]/layout.tsx for the public-site counterpart). Light-first (the
// dashboard is a daytime work tool) with its own theme storage key, so staff
// toggling the dashboard to dark doesn't also re-theme the public site. No
// sidebar chrome here: the authenticated shell with sidebar/topbar lives in
// app/admin/(dashboard)/layout.tsx so the login page can render standalone.
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${interTight.variable} ${inter.variable} h-full antialiased`}
      style={
        {
          "--font-heading": "var(--font-heading-family)",
          "--font-sans": "var(--font-sans-family)",
        } as React.CSSProperties
      }
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider defaultTheme="light" enableSystem={false} storageKey="royal-exceed-admin-theme">
          <TooltipProvider delay={150}>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
