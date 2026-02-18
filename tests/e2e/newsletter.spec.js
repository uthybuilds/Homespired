import { expect, test } from "@playwright/test";

test("newsletter popup submits first-visit signup", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("homespired_newsletter_prompted_v1");
  });
  const requestPromise = page.waitForRequest((req) => {
    if (!req.url().includes("/functions/v1/form-delivery")) return false;
    const body = req.postData();
    if (!body) return false;
    try {
      return JSON.parse(body).type === "newsletter_signup";
    } catch {
      return false;
    }
  });

  await page.route("**/functions/v1/form-delivery", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    }),
  );
  await page.route("**/undefined/functions/v1/form-delivery", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    }),
  );

  await page.goto("/");
  const popupCard = page
    .getByRole("heading", { name: "Stay in the loop with Homespired." })
    .locator("..")
    .locator("..")
    .locator("..");
  await expect(popupCard).toBeVisible();
  await popupCard.getByPlaceholder("Email address").fill("newsletter@test.com");
  await popupCard.getByRole("button", { name: "Subscribe" }).click();
  await expect(popupCard).not.toBeVisible();

  const payload = (await requestPromise).postData();
  expect(payload).toContain("newsletter_signup");
});
