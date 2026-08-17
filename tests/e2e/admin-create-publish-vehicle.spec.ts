import { test, expect } from "./fixtures/auth";

/**
 * Critical flow 2 (spec §14): an admin creates a model with a variant, colors,
 * and specs, publishes it, and it's live on the public site without a redeploy.
 */
test("admin can create and publish a new model, live immediately on the public site", async ({ adminPage }) => {
  const uniqueCode = `E2E${Date.now().toString().slice(-6)}`;
  const displayName = `Soueast ${uniqueCode}`;

  await adminPage.goto("/admin/models/new");

  await adminPage.getByLabel("Model code").fill(uniqueCode);
  await adminPage.getByLabel("Display name").fill(displayName);
  await adminPage.getByLabel("Description").fill("Playwright end-to-end test model — safe to delete.");

  // Add one variant (fuel/transmission/drivetrain default to sensible values on append).
  await adminPage.getByRole("tab", { name: /Variants/ }).click();
  await adminPage.getByRole("button", { name: "Add variant" }).click();
  await adminPage.getByPlaceholder("Variant name").fill("Comfort");

  // Add one color.
  await adminPage.getByRole("tab", { name: /Colors/ }).click();
  await adminPage.getByRole("button", { name: "Add color" }).click();
  await adminPage.getByPlaceholder("Color name").fill("Pearl White");

  // Add one spec group + row.
  await adminPage.getByRole("tab", { name: "Specs" }).click();
  await adminPage.getByRole("button", { name: "Add spec group" }).click();
  await adminPage.getByPlaceholder("Group title (e.g. Engine & Performance)").fill("Engine & Performance");
  await adminPage.getByRole("button", { name: "Add row" }).click();
  await adminPage.getByPlaceholder("Label").fill("Engine");
  await adminPage.getByPlaceholder("Value").fill("1.5L Turbo");

  // Publish.
  await adminPage.getByRole("tab", { name: "General" }).click();
  await adminPage.getByText("Published", { exact: true }).click();

  await adminPage.getByRole("button", { name: "Create model" }).click();

  await expect(adminPage).toHaveURL(/\/admin\/models\/[a-z0-9]+$/i, { timeout: 15_000 });

  const slug = uniqueCode.toLowerCase();
  await adminPage.goto(`/models/${slug}`);
  await expect(adminPage.getByRole("heading", { name: displayName, level: 1 })).toBeVisible();
  await expect(adminPage.getByText("Engine & Performance")).toBeVisible();
});
