import { expect, test } from "@playwright/test";

const adminSeed = {
  catalog: [
    {
      id: "chair-1",
      name: "Rose Chair",
      price: 120000,
      category: "Furniture",
      image: "https://example.com/chair.jpg",
      description: "Soft velvet chair.",
      inventory: 2,
    },
    {
      id: "lamp-1",
      name: "Halo Lamp",
      price: 45000,
      category: "Lighting",
      image: "https://example.com/lamp.jpg",
      description: "Warm brass lamp.",
      inventory: 8,
    },
  ],
  orders: [
    {
      id: "order-1",
      number: 1,
      label: "Order 1",
      status: "Pending",
      items: [
        { id: "chair-1", name: "Rose Chair", price: 120000, quantity: 1 },
      ],
      subtotal: 120000,
      shipping: 5000,
      discountAmount: 0,
      total: 125000,
      createdAt: 1710000000000,
      customer: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        phone: "08012345678",
        address: "12 Orchid Way",
        city: "Lagos",
        state: "LA",
      },
    },
  ],
  customers: [
    {
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "08012345678",
      address: "12 Orchid Way",
      city: "Lagos",
      state: "LA",
      createdAt: 1710000000000,
    },
  ],
  discounts: [
    {
      code: "VIP10",
      type: "percent",
      value: 10,
      minSubtotal: 100000,
      expiresAt: null,
      active: true,
      createdAt: 1710000000000,
    },
  ],
  analytics: {
    storeViews: 12,
    cartAdds: 6,
    checkouts: 2,
    lastCheckoutAt: 1710000000000,
  },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((data) => {
    localStorage.setItem("homespired_catalog_v1", JSON.stringify(data.catalog));
    localStorage.setItem("homespired_orders_v1", JSON.stringify(data.orders));
    localStorage.setItem(
      "homespired_customers_v1",
      JSON.stringify(data.customers),
    );
    localStorage.setItem(
      "homespired_discounts_v1",
      JSON.stringify(data.discounts),
    );
    localStorage.setItem(
      "homespired_analytics_v1",
      JSON.stringify(data.analytics),
    );
  }, adminSeed);
});

test("admin dashboard shows orders, customers, discounts, analytics, alerts", async ({
  page,
}) => {
  await page.route("**/functions/v1/form-delivery", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    }),
  );
  await page.goto("/admin");
  await page.getByRole("button", { name: "Orders" }).click();
  await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
  await expect(page.getByText("Order 1")).toBeVisible();
  const statusSelect = page
    .locator("select")
    .filter({ has: page.locator('option[value="Pending"]') })
    .first();
  await expect(statusSelect).toHaveValue("Pending");
  const [request] = await Promise.all([
    page.waitForRequest((req) => {
      if (!req.url().includes("/functions/v1/form-delivery")) return false;
      const body = req.postData();
      if (!body) return false;
      try {
        return JSON.parse(body).type === "payment_confirmed";
      } catch {
        return false;
      }
    }),
    statusSelect.selectOption("Confirmed"),
  ]);
  const payload = request.postData();
  expect(payload).toContain("payment_confirmed");
  await page.getByRole("button", { name: "Customers" }).click();
  await expect(page.getByRole("heading", { name: "Customers" })).toBeVisible();
  await expect(page.getByText("Ada Lovelace").first()).toBeVisible();
  await page.getByRole("button", { name: "Discounts" }).click();
  await expect(page.getByRole("heading", { name: "Discounts" })).toBeVisible();
  await expect(page.getByText("VIP10")).toBeVisible();
  await page.getByRole("button", { name: "Analytics" }).click();
  await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
  await page.getByRole("button", { name: "Inventory" }).click();
  const alertsSection = page
    .getByRole("heading", { name: "Inventory Alerts" })
    .locator("..");
  await expect(alertsSection).toBeVisible();
  await expect(alertsSection.getByText("Rose Chair")).toBeVisible();
});
