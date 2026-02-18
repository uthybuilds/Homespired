import { expect, test } from "@playwright/test";

const cartSeed = {
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
  updatedAt: Date.now() - 1000 * 60 * 60 * 26,
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((data) => {
    localStorage.setItem("homespired_cart_v1", JSON.stringify(data.cart));
    localStorage.setItem("homespired_cart_updated_v1", String(data.updatedAt));
  }, cartSeed);
});

test("cart shows abandoned notice and supports clear cart", async ({ page }) => {
  await page.goto("/cart");
  await expect(
    page.getByText("You left items in your cart."),
  ).toBeVisible();
  await expect(page.getByText("Rose Chair")).toBeVisible();
  await page.getByRole("button", { name: "Clear Cart" }).click();
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
});
