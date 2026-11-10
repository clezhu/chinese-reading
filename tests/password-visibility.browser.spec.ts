import { expect, test } from "@playwright/test";

for (const mode of ["login", "register"]) {
  test(`${mode} password can be revealed and hidden without submitting or losing its value`, async ({ page }) => {
    await page.goto(`/${mode}`);
    const password = page.getByLabel("Password", { exact: true });
    await expect(password).toHaveAttribute("type", "password");
    await password.fill("Garden1!");
    const show = page.getByRole("button", { name: "Show password", exact: true });
    await expect(show).toHaveAttribute("type", "button");
    await show.focus();
    await page.keyboard.press("Enter");
    await expect(password).toHaveAttribute("type", "text");
    await expect(password).toHaveValue("Garden1!");
    const hide = page.getByRole("button", { name: "Hide password", exact: true });
    await expect(hide).toBeFocused();
    await page.keyboard.press("Space");
    await expect(password).toHaveAttribute("type", "password");
    await expect(password).toHaveValue("Garden1!");
    await expect(page).toHaveURL(new RegExp(`/${mode}$`));
  });
}

test("signup requires matching passwords and both eye toggles work independently", async ({ page }) => {
  await page.route("**/availability", async (route) => {
    const username = new URLSearchParams(route.request().postData() ?? "").get("username");
    await route.fulfill({ json: { username, available: true } });
  });
  await page.goto("/register");
  const password = page.getByLabel("Password", { exact: true });
  const confirmation = page.getByLabel("Confirm password", { exact: true });
  const submit = page.getByRole("button", { name: "Create account", exact: true });
  await expect(page.locator("#confirmation-message")).toBeEmpty();
  await page.getByLabel("Username", { exact: true }).fill("matching_reader");
  await password.fill("Garden1!");
  await expect(page.locator("#username-message")).toHaveText("✓ Username available");
  await expect(submit).toBeDisabled();
  await confirmation.fill("Garden2!");
  await expect(page.locator("#confirmation-message")).toHaveText("Passwords do not match.");
  await expect(confirmation).toHaveAttribute("aria-invalid", "true");
  await expect(submit).toBeDisabled();
  await page.getByRole("button", { name: "Show confirmation password", exact: true }).click();
  await expect(confirmation).toHaveAttribute("type", "text");
  await expect(confirmation).toHaveValue("Garden2!");
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show password", exact: true }).click();
  await page.getByRole("button", { name: "Hide confirmation password", exact: true }).click();
  await expect(confirmation).toHaveAttribute("type", "password");
  await expect(password).toHaveAttribute("type", "text");
  await confirmation.fill("Garden1!");
  await expect(page.locator("#confirmation-message")).toBeEmpty();
  await expect(submit).toBeEnabled();
  await password.fill("Garden3!");
  await expect(page.locator("#confirmation-message")).toHaveText("Passwords do not match.");
  await expect(submit).toBeDisabled();
  await confirmation.fill("");
  await expect(page.locator("#confirmation-message")).toHaveText("Enter your password again.");
  await expect(page).toHaveURL(/\/register$/);
});
