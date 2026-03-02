import { test, expect } from "@playwright/test";

test("homepage loads and shows city search", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Steuerberater in Österreich/ })).toBeVisible();
  await expect(page.getByPlaceholder("Stadt suchen...")).toBeVisible();
});

test("city search filters results", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Stadt suchen...").fill("Wien");
  await expect(page.getByText("Wien")).toBeVisible();
});
