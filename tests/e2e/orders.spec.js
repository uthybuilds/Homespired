import { expect, test } from "@playwright/test";

const ordersSeed = {
  orders: [
    {
      id: "order-1",
      label: "Order 1",
      status: "Pending",
      total: 125000,
      createdAt: 1710000000000,
      customer: {
        name: "Ada Lovelace",
        email: "ada@example.com",
      },
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((data) => {
    localStorage.setItem("homespired_orders_v1", JSON.stringify(data.orders));
  }, ordersSeed);
});

test("orders page shows saved orders for signed-in customer", async ({
  page,
}) => {
  await page.goto("/orders");
  await expect(page.getByText("Order 1")).toBeVisible();
  await expect(page.getByText("Pending")).toBeVisible();
  await expect(page.getByText("₦125,000")).toBeVisible();
});
