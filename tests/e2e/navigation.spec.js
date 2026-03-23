const { test, expect } = require("@playwright/test");
const { ensureAccess } = require("./helpers/access");

test("map pin filter navigation updates URL", async ({ page }) => {
  await ensureAccess(page);
  await page.goto("/beans?country=Brazil&region=Minas%20Gerais");
  await expect(page).toHaveURL(/country=Brazil/);
  await expect(page.getByLabel(/country/i)).toHaveValue("Brazil");
});
