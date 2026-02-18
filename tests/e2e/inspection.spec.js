import { expect, test } from "@playwright/test";

const inspectionSeed = {
  settings: {
    whatsappNumber: "09026561373",
    inspectionOptions: [
      {
        id: "outside-lagos-inspection",
        title: "Outside Lagos Inspection",
        price: 0,
        summary: "Speak with a representative to schedule travel and scope.",
        redirectOnly: true,
      },
    ],
    consultationOptions: [],
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
  }, inspectionSeed);
});

test("inspection redirect-only request prepares WhatsApp redirect", async ({
  page,
}) => {
  await page.goto("/inspections/outside-lagos-inspection");
  await page.getByPlaceholder("Full name").fill("Ada Lovelace");
  await page.getByPlaceholder("Phone number").fill("08012345678");
  await page.getByPlaceholder("Email address").fill("ada@example.com");
  await page.getByRole("button", { name: "Send Request" }).click();

  await expect(
    page.getByText("Request ready. We will confirm shortly."),
  ).toBeVisible();

  const redirect = await page.evaluate(() => window.__e2eLastRedirect || "");
  expect(redirect).toContain("wa.me");
});
