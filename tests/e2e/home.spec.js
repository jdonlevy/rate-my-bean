const { test, expect } = require("@playwright/test");
const { ensureAccess } = require("./helpers/access");

test("home page loads", async ({ page }) => {
  await ensureAccess(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /global bean origins/i })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /all beans/i })).toBeVisible();
});
