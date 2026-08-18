import { test, expect } from "./fixtures/auth";

/**
 * Critical flow 1 (spec §14): a visitor books a test drive, and it appears in
 * the admin within seconds. Both halves run against the same seeded DB.
 */
test.describe("Test drive booking", () => {
  const uniqueName = `Playwright Tester ${Date.now()}`;

  test("visitor can submit a test-drive booking and receive a confirmation", async ({ page }) => {
    await page.goto("/test-drive");

    await page.getByLabel("Full name").fill(uniqueName);
    await page.getByLabel("Phone number").fill("+211920001234");

    // Pick the first available model in the select.
    await page.getByRole("combobox", { name: "Preferred model" }).click();
    await page.getByRole("option").first().click();

    // Randomize the date (1-90 days out) and time slot so repeated local runs
    // don't collide with a previous run's booking — the DB enforces a real
    // @@unique([preferredDate, timeSlot]) constraint, so a fixed date+slot
    // would only succeed once per database.
    const date = new Date();
    date.setDate(date.getDate() + 1 + Math.floor(Math.random() * 90));
    const iso = date.toISOString().slice(0, 10);
    await page.locator('input[type="date"]').fill(iso);

    await page.getByRole("combobox", { name: "Preferred time" }).click();
    const options = page.getByRole("option");
    const count = await options.count();
    await options.nth(Math.floor(Math.random() * count)).click();

    await page.getByText(/I agree to be contacted/).click();

    await page.getByRole("button", { name: "Book Test Drive" }).click();

    await expect(page.getByText("Test drive booked!")).toBeVisible({ timeout: 15_000 });
    const referenceText = await page.getByText(/Your reference number is/).textContent();
    expect(referenceText).toMatch(/TD-\d{4}-\d{4}/);
  });

  test("the booking appears in the admin test-drives list immediately", async ({ adminPage }) => {
    await adminPage.goto("/admin/test-drives");
    await expect(adminPage.getByText(uniqueName)).toBeVisible({ timeout: 10_000 });
  });
});
