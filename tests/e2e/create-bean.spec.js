const { test, expect } = require("@playwright/test");
const { ensureAccess } = require("./helpers/access");

const allowWrite = process.env.E2E_ALLOW_WRITE === "true";

test.describe("create bean", () => {
  test.skip(!allowWrite, "Set E2E_ALLOW_WRITE=true to enable write tests.");

  test("can add a new bean", async ({ page }) => {
    await ensureAccess(page);
    await page.goto("/beans/new");

    const name = `E2E Blend ${Date.now()}`;

    await page.getByLabel(/origin country/i).fill("Brazil");
    await page.getByRole("button", { name: "Brazil" }).click();

    await page.getByLabel(/origin region/i).fill("Minas");
    await page.getByRole("button", { name: /Minas Gerais/i }).click();

    await page.getByLabel(/blend name/i).fill(name);

    await page.getByRole("button", { name: /save bean/i }).click();

    await expect(page).toHaveURL(/\/beans\/\d+/);
    await expect(page.getByRole("heading", { name })).toBeVisible();
  });
});
