import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";

const settingsSeed = {
  bankName: "Zenith Bank",
  accountName: "Homespired Studio",
  accountNumber: "1234567890",
  classOptions: [
    {
      id: "class-physical",
      title: "Physical Class",
      price: 1000000,
      summary: "Hands-on interior design training in a studio setting.",
    },
    {
      id: "class-online",
      title: "Online Class",
      price: 600000,
      summary: "Live online sessions with guided coursework and support.",
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((data) => {
    localStorage.setItem("homespired_settings_v1", JSON.stringify(data));
  }, settingsSeed);
});

test("class enrollment submits payment proof and sends email", async ({
  page,
}) => {
  const requestPromise = page.waitForRequest((req) => {
    if (!req.url().includes("/functions/v1/form-delivery")) return false;
    const body = req.postData();
    if (!body) return false;
    try {
      return JSON.parse(body).type === "class_request";
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
  await page.route("https://api.cloudinary.com/v1_1/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        secure_url: "https://example.com/proof.jpg",
      }),
    }),
  );
  await page.goto("/classes/class-physical");

  await page.getByPlaceholder("Full name").fill("Tomi Ade");
  await page.getByPlaceholder("Email address").fill("tomi@example.com");
  await page.getByPlaceholder("Phone number").fill("09012345678");
  await page.getByPlaceholder("Project address").fill("Lekki");
  await page
    .getByPlaceholder("Tell us about your goals")
    .fill("Ready to start.");
  await page.locator('input[type="file"]').setInputFiles({
    name: "proof.png",
    mimeType: "image/png",
    buffer: Buffer.from("fake"),
  });
  await page.getByRole("button", { name: "Confirm Payment" }).click();

  await expect(page.getByText("Request received")).toBeVisible();
  const payload = (await requestPromise).postData();
  expect(payload).toContain("class_request");
});
