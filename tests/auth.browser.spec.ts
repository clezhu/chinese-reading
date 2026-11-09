import { test, expect } from "@playwright/test";
import { account as baseAccount, firstLesson, login, logout, post } from "./helpers";
import type { Page } from "@playwright/test";

function account() { return { ...baseAccount(), password: "Garden1!" }; }

async function register(page: Page, credentials = account()) {
  await page.goto("/register");
  await page.getByLabel("Username", { exact: true }).fill(credentials.username);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page).toHaveURL(/\/lessons$/);
  return credentials;
}

function expectLoginRedirect(response: { status(): number; headers(): Record<string, string> }) {
  expect([302, 303]).toContain(response.status());
  expect(response.headers().location).toBe("/register");
}

test("register with username/password only; logout revokes a copied cookie, then login restores access", async ({ page, context, request }) => {
  await page.goto("/lessons");
  await expect(page).toHaveURL(/\/register$/);
  await page.getByRole("link", { name: "Log in", exact: true }).click();
  await expect(page.getByText("Contact admin at chloe.chenge.zhu@gmail.com for help.", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Create an account", exact: true }).click();
  await expect(page.locator("input")).toHaveCount(2);
  await expect(page.getByLabel("Email", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/No account recovery. We do not collect email addresses./)).toBeVisible();
  await expect(page.getByText(/Keep your username and password safe./)).toBeVisible();

  const credentials = await register(page);
  const cookies = await context.cookies();
  expect(cookies).toHaveLength(1);
  const session = cookies[0];
  expect(session.httpOnly).toBe(true);
  expect(session.sameSite).toBe("Lax");
  expect(session.path).toBe("/");
  const stolenCookie = `${session.name}=${session.value}`;
  await expect(page.locator("body")).not.toContainText(credentials.password);

  // Check the copied token works before logout, so revocation assertions cannot
  // pass because the replay setup was broken in the first place.
  expect((await request.get("/lessons", { headers: { Cookie: stolenCookie }, maxRedirects: 0 })).status()).toBe(200);
  await logout(page);
  expect(await context.cookies()).toHaveLength(0);
  await page.goto(firstLesson);
  await expect(page).toHaveURL(/\/register$/);
  expectLoginRedirect(await request.get("/lessons", { headers: { Cookie: stolenCookie }, maxRedirects: 0 }));
  expectLoginRedirect(await post(request, firstLesson, { intent: "start" }, { Cookie: stolenCookie }));
  await login(page, { ...credentials, username: credentials.username.toUpperCase() });
  await expect(page.getByText(credentials.username, { exact: true })).toBeVisible();
  expect((await context.cookies())[0].value).not.toBe(session.value);
});

test("duplicate usernames and incorrect login attempts give useful, password-free feedback", async ({ page }) => {
  const credentials = await register(page);
  await logout(page);
  await page.goto("/register");
  await page.getByLabel("Username", { exact: true }).fill(credentials.username.toUpperCase());
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await expect(page.locator("#username-message")).toHaveText("Username taken");
  await expect(page.getByRole("button", { name: "Create account", exact: true })).toBeDisabled();
  await expect(page.locator("#username")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#username-message")).not.toContainText(credentials.password);

  await page.getByRole("link", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Welcome back", exact: true })).toBeVisible();
  for (const username of [credentials.username, account().username]) {
    await page.getByLabel("Username", { exact: true }).fill(username);
    await page.getByLabel("Password", { exact: true }).fill("a wrong but valid-length password");
    const rejected = page.waitForResponse((response) =>
      new URL(response.url()).pathname.startsWith("/login") && response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    expect((await rejected).status()).toBe(400);
    await expect(page.getByRole("alert")).toHaveText("Incorrect username or password.");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("alert")).not.toContainText("a wrong but valid-length password");
    expectLoginRedirect(await page.request.get("/lessons", { maxRedirects: 0 }));
  }
  await login(page, credentials);
});

test("both credential endpoints validate forged forms on the server", async ({ request }) => {
  const { username, password } = account();
  const invalid: { name: string; form: Record<string, string> | string; feedback: string }[] = [
    { name: "missing username", form: { password }, feedback: "Enter a username." },
    { name: "short username", form: { username: "ab", password }, feedback: "Use 3–32 characters." },
    { name: "invalid username", form: { username: "bad name!", password }, feedback: "No spaces." },
    { name: "long username", form: { username: "a".repeat(33), password }, feedback: "Use 3–32 characters." },
    { name: "missing password", form: { username }, feedback: "Enter a password." },
    { name: "short password", form: { username, password: "short" }, feedback: "Use at least 8 characters." },
    { name: "long password", form: { username, password: "x".repeat(129) }, feedback: "Use at most 128 characters." },
    { name: "duplicate username", form: `username=${username}&username=other&password=${encodeURIComponent(password)}`, feedback: "Use letters, numbers or _." },
    { name: "duplicate password", form: `username=${username}&password=${encodeURIComponent(password)}&password=other`, feedback: "Enter a password." },
  ];
  for (const endpoint of ["/register", "/login"]) {
    for (const { name, form, feedback } of invalid) {
      await test.step(`${endpoint}: ${name}`, async () => {
        const response = await post(request, endpoint, form);
        expect(response.status()).toBe(400);
        const body = await response.text();
        if (endpoint === "/login") expect(body).toContain("Incorrect username or password.");
        else expect(body).toContain(feedback);
        expect(body).not.toContain(password);
        expect(response.headers()["set-cookie"]).toBeUndefined();
      });
    }
  }
  expectLoginRedirect(await request.get("/lessons", { maxRedirects: 0 }));
});

test("logging in again rotates the session and invalidates the previous token", async ({ page, context, request }) => {
  const credentials = await register(page);
  const previous = (await context.cookies())[0];
  const cookie = `${previous.name}=${previous.value}`;
  const response = await post(page.request, "/login", credentials);
  expect(response.status()).toBe(303);
  expect((await context.cookies())[0].value).not.toBe(previous.value);
  expectLoginRedirect(await request.get("/lessons", { headers: { Cookie: cookie }, maxRedirects: 0 }));
  await page.reload();
  await expect(page.getByText(credentials.username, { exact: true })).toBeVisible();
});

test("mutations require same-origin POST; GET logout cannot log a learner out", async ({ page, request }) => {
  const credentials = account();
  for (const path of ["/register", "/login"]) {
    const response = await post(request, path, credentials, { Origin: "https://attacker.invalid" });
    // React Router may reject the origin before the application's 403 guard.
    expect([400, 403]).toContain(response.status());
  }
  expectLoginRedirect(await post(request, firstLesson, { intent: "start" }));
  await register(page, credentials);
  const rejectedHeaders: Record<string, string>[] = [
    { Origin: "" }, { Origin: "https://attacker.invalid" }, { "Sec-Fetch-Site": "cross-site" },
  ];
  for (const path of [firstLesson, "/logout"]) {
    for (const headers of rejectedHeaders) {
      expect([400, 403]).toContain((await post(page.request, path, { intent: "start" }, headers)).status());
    }
  }
  expect((await page.request.get("/logout")).status()).toBe(405);
  await page.reload();
  await expect(page).toHaveURL(/\/lessons$/);
  await expect(page.getByText(credentials.username, { exact: true })).toBeVisible();
});
