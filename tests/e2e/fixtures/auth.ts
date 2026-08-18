import { test as base, expect, type Page } from "@playwright/test";

const SUPER_ADMIN_EMAIL = process.env.SEED_SUPER_ADMIN_EMAIL ?? "admin@exceedlimited.com";
const SUPER_ADMIN_PASSWORD = process.env.SEED_SUPER_ADMIN_PASSWORD ?? "ChangeMe123!";

async function loginAsSuperAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(SUPER_ADMIN_EMAIL);
  await page.getByLabel("Password").fill(SUPER_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  // The login Server Action does Supabase auth + Prisma lookups + an audit-log
  // write; give it real headroom in this sandbox rather than the 5s default.
  await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 20_000 });
  // Let the post-login dashboard finish its own navigation/network activity
  // before the test issues another goto() — otherwise the still-in-flight
  // redirect can abort the next navigation ("frame was detached").
  await page.waitForLoadState("load");
}

export const test = base.extend<{ adminPage: Page }>({
  adminPage: async ({ page }, use) => {
    await loginAsSuperAdmin(page);
    await use(page);
  },
});

export { expect };
