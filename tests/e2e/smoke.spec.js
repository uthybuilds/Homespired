import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/portfolio",
  "/shop",
  "/consultations",
  "/inspections",
  "/advisory",
  "/contact",
  "/about",
  "/faq",
  "/testimonials",
  "/process",
  "/press",
  "/careers",
  "/blog",
  "/shipping",
  "/terms",
  "/privacy",
  "/refunds",
];

test("static pages render core headings", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.getByRole("heading").first()).toBeVisible();
  }
});
