import { expect, test } from "@playwright/test";

const productSeed = {
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
  reviews: [
    {
      id: "review-1",
      productId: "chair-1",
      name: "Zara",
      rating: 5,
      comment: "Beautiful finish.",
      createdAt: 1710000000000,
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((data) => {
    localStorage.setItem("homespired_catalog_v1", JSON.stringify(data.catalog));
    localStorage.setItem(
      "homespired_reviews_v1",
      JSON.stringify(data.reviews),
    );
  }, productSeed);
});

test("product page shows reviews and allows posting", async ({ page }) => {
  await page.goto("/shop/chair-1");
  await expect(page.getByText("Reviews")).toBeVisible();
  await expect(page.getByText("Beautiful finish.")).toBeVisible();
  await page.getByPlaceholder("Your name").fill("Noah");
  await page.getByPlaceholder("Share your experience").fill("Love it.");
  await page.getByRole("button", { name: "Post Review" }).click();
  await expect(page.getByText("Love it.")).toBeVisible();
});
