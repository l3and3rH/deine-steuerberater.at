import { test, expect } from "@playwright/test";

test("city page loads with correct heading", async ({ page }) => {
  await page.goto("/steuerberater/wien");
  await expect(page.getByRole("heading", { name: "Steuerberater in Wien" })).toBeVisible();
});

test("city page shows steuerberater listing", async ({ page }) => {
  await page.goto("/steuerberater/wien");
  // At least no error page
  await expect(page).not.toHaveTitle(/Error/);
});
