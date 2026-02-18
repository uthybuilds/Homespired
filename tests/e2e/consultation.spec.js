import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";

const consultationSeed = {
  settings: {
    whatsappNumber: "09026561373",
    bankName: "Providus Bank",
    accountName: "Designs by Homespired",
    accountNumber: "1305131099",
    inspectionOptions: [],
    consultationOptions: [
      {
        id: "bespoke-advisory",
        title: "The Bespoke Advisory",
        price: 100000,
        summary: "Focused guidance.",
      },
    ],
    shippingZones: [],
    inventoryAlertThreshold: 3,
  },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((data) => {
    localStorage.setItem(
      "homespired_settings_v1",
      JSON.stringify(data.settings),
    );
  }, consultationSeed);
});

test("consultation request submits with proof and edge delivery", async ({
  page,
}) => {
  await page.route("https://api.cloudinary.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ secure_url: "https://example.com/proof.jpg" }),
    }),
  );
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

  await page.goto("/advisory/bespoke-advisory");
  await page.getByPlaceholder("Full name").fill("Ada Lovelace");
  await page.getByPlaceholder("Phone number").fill("08012345678");
  await page.getByPlaceholder("Email address").fill("ada@example.com");
  await page.getByPlaceholder("Project address").fill("12 Orchid Way");
  await page.getByPlaceholder("City").fill("Lagos");
  await page.getByPlaceholder("State").fill("LA");
  await page
    .getByPlaceholder("Tell us about your project")
    .fill("A new lounge");
  await page.locator('input[type="file"]').setInputFiles({
    name: "proof.png",
    mimeType: "image/png",
    buffer: Buffer.from("proof"),
  });
  await page.getByRole("button", { name: "Confirm Payment" }).click();

  await expect(
    page.getByText("Request received. We will confirm shortly."),
  ).toBeVisible();
});
