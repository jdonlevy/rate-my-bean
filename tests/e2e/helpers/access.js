const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";

async function ensureAccess(page) {
  const accessCode = process.env.E2E_ACCESS_CODE;
  if (!accessCode) return;

  const res = await page.request.post("/api/access", {
    data: { code: accessCode, next: "/" },
  });

  if (!res.ok()) {
    throw new Error(`Access code rejected: ${res.status()}`);
  }

  const origin = new URL(baseURL).origin;
  await page.context().addCookies([
    {
      name: "rmb_access",
      value: "1",
      url: origin,
      path: "/",
    },
  ]);
}

module.exports = { ensureAccess };
