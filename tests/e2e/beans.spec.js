const { test, expect } = require("@playwright/test");
const { ensureAccess } = require("./helpers/access");

test("beans list page renders filters", async ({ page }) => {
  await ensureAccess(page);
  await page.goto("/beans");
  await expect(page.getByRole("heading", { name: /all beans/i })).toBeVisible();
  await expect(page.getByLabel(/search/i)).toBeVisible();
  await expect(page.getByLabel(/country/i)).toBeVisible();
  await expect(page.getByLabel(/region/i)).toBeVisible();
  await expect(page.getByLabel(/min price/i)).toBeVisible();
  await expect(page.getByLabel(/min rating/i)).toBeVisible();
});
