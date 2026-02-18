import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";

const checkoutSeed = {
  catalog: [
    {
      id: "chair-1",
      name: "Rose Chair",
      price: 120000,
      category: "Furniture",
      image: "https://example.com/chair.jpg",
      description: "Soft velvet chair.",
      inventory: 5,
    },
  ],
  cart: [
    {
      id: "chair-1",
      name: "Rose Chair",
      price: 120000,
      category: "Furniture",
      image: "https://example.com/chair.jpg",
      quantity: 1,
    },
  ],
  discounts: [
    {
      code: "VIP10",
      type: "percent",
      value: 10,
      minSubtotal: 0,
      expiresAt: null,
      active: true,
      createdAt: 1710000000000,
    },
  ],
  settings: {
    whatsappNumber: "09026561373",
    bankName: "Providus Bank",
    accountName: "Designs by Homespired",
    accountNumber: "1305131099",
    shippingZones: [
      { id: "lagos-island", label: "Lagos Island", price: 5000 },
      { id: "lagos-mainland", label: "Lagos Mainland", price: 3500 },
      { id: "outside-lagos", label: "Outside Lagos", price: 15000 },
    ],
    inspectionOptions: [],
    consultationOptions: [],
    inventoryAlertThreshold: 3,
  },
  analytics: {
    storeViews: 1,
    cartAdds: 1,
    checkouts: 1,
    lastCheckoutAt: null,
  },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((data) => {
    localStorage.setItem("homespired_catalog_v1", JSON.stringify(data.catalog));
    localStorage.setItem("homespired_cart_v1", JSON.stringify(data.cart));
    localStorage.setItem(
      "homespired_discounts_v1",
      JSON.stringify(data.discounts),
    );
    localStorage.setItem(
      "homespired_settings_v1",
      JSON.stringify(data.settings),
    );
    localStorage.setItem(
      "homespired_analytics_v1",
      JSON.stringify(data.analytics),
    );
  }, checkoutSeed);
});

test("checkout submits with discount and updates storage", async ({
  page,
}) => {
  await page.route("https://api.cloudinary.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ secure_url: "https://example.com/proof.jpg" }),
    }),
  );

  await page.goto("/checkout");
  await page.getByPlaceholder("Full name").fill("Ada Lovelace");
  await page.getByPlaceholder("Email address").fill("ada@example.com");
  await page.getByPlaceholder("Phone number").fill("08012345678");
  await page.getByPlaceholder("Delivery address").fill("12 Orchid Way");
  await page.getByRole("combobox").selectOption("lagos-mainland");
  await page.getByPlaceholder("Discount code").fill("VIP10");
  await page.locator('input[type="file"]').setInputFiles({
    name: "proof.png",
    mimeType: "image/png",
    buffer: Buffer.from("proof"),
  });

  await page
    .getByRole("button", { name: "Confirm Payment via WhatsApp" })
    .click();

  await expect
    .poll(async () => {
      const orders = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("homespired_orders_v1") || "[]"),
      );
      return orders.length;
    })
    .toBe(1);

  const snapshot = await page.evaluate(() => ({
    orders: JSON.parse(localStorage.getItem("homespired_orders_v1") || "[]"),
    cart: JSON.parse(localStorage.getItem("homespired_cart_v1") || "[]"),
    catalog: JSON.parse(localStorage.getItem("homespired_catalog_v1") || "[]"),
    customers: JSON.parse(
      localStorage.getItem("homespired_customers_v1") || "[]",
    ),
    analytics: JSON.parse(
      localStorage.getItem("homespired_analytics_v1") || "{}",
    ),
    redirect: window.__e2eLastRedirect || "",
  }));

  expect(snapshot.orders).toHaveLength(1);
  expect(snapshot.orders[0].status).toBe("Pending");
  expect(snapshot.orders[0].deliveryDate).toBe("");
  expect(snapshot.orders[0].deliveryTime).toBe("");
  expect(snapshot.orders[0].discountCode).toBe("VIP10");
  expect(snapshot.orders[0].discountAmount).toBe(12000);
  expect(snapshot.orders[0].zoneId).toBe("lagos-mainland");
  expect(snapshot.orders[0].shipping).toBe(3500);
  expect(snapshot.cart).toHaveLength(0);
  expect(snapshot.catalog[0].inventory).toBe(4);
  expect(snapshot.customers[0].email).toBe("ada@example.com");
  expect(snapshot.analytics.checkouts).toBe(2);
  expect(snapshot.redirect).toContain("wa.me");
});
