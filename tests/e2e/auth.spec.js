import { expect, test } from "@playwright/test";

const userResponse = {
  id: "user-1",
  email: "user@example.com",
  user_metadata: { full_name: "Ada Lovelace", role: "user" },
};

const sessionResponse = {
  access_token: "token",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "refresh",
  user: userResponse,
};

test.beforeEach(async ({ page }) => {
  await page.route("**/auth/v1/token**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(sessionResponse),
    }),
  );
  await page.route("**/auth/v1/signup**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: userResponse, session: null }),
    }),
  );
  await page.route("**/auth/v1/recover**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    }),
  );
  await page.route("**/auth/v1/user**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: userResponse }),
    }),
  );
});

test("login succeeds and navigates to account", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Email address").fill("user@example.com");
  await page.getByPlaceholder("Password").fill("password");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/account$/);
});

test("signup succeeds and navigates to confirm email", async ({ page }) => {
  await page.goto("/signup");
  await page.getByPlaceholder("Full name").fill("Ada Lovelace");
  await page.getByPlaceholder("Email address").fill("ada@example.com");
  await page.getByPlaceholder("Password").fill("password");
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL(/\/confirm-email$/);
  await expect(
    page.getByText("Check your email to confirm your account."),
  ).toBeVisible();
});

test("forgot password shows success message", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByPlaceholder("Email address").fill("user@example.com");
  await page.getByRole("button", { name: "Send Reset Link" }).click();
  await expect(
    page.getByText("Check your email for the password reset link."),
  ).toBeVisible();
});

test("confirm email recovery updates password", async ({ page }) => {
  await page.goto("/confirm-email?type=recovery&code=test");
  await expect(
    page.getByText("Set a new password to complete the reset."),
  ).toBeVisible();
  await page.getByPlaceholder("New password").fill("newpassword");
  await page.getByRole("button", { name: "Update Password" }).click();
  await expect(
    page.getByText("Password updated. You can now sign in."),
  ).toBeVisible();
});
