import { test, expect } from "@playwright/test";
import { account, expectLoginRedirect, firstLesson, login, logout, post, register } from "./helpers";

test("register with username/password only; logout revokes a copied cookie, then login restores access", async ({ page, context, request }) => {
  await page.goto("/lessons");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("No account recovery.", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Create an account", exact: true }).click();
  await expect(page.locator("input")).toHaveCount(2);
  await expect(page.getByLabel("Email", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/There is no password reset or account recovery/)).toBeVisible();

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
  await expect(page).toHaveURL(/\/login$/);
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
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("That username is already taken");
  await expect(page.getByRole("alert")).not.toContainText(credentials.password);

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
  const invalid: { name: string; form: Record<string, string> | string; feedback: "username" | "password" }[] = [
    { name: "missing username", form: { password }, feedback: "username" },
    { name: "short username", form: { username: "ab", password }, feedback: "username" },
    { name: "invalid username", form: { username: "bad name!", password }, feedback: "username" },
    { name: "long username", form: { username: "a".repeat(33), password }, feedback: "username" },
    { name: "missing password", form: { username }, feedback: "password" },
    { name: "short password", form: { username, password: "short" }, feedback: "password" },
    { name: "long password", form: { username, password: "x".repeat(129) }, feedback: "password" },
    { name: "duplicate username", form: `username=${username}&username=other&password=${encodeURIComponent(password)}`, feedback: "username" },
    { name: "duplicate password", form: `username=${username}&password=${encodeURIComponent(password)}&password=other`, feedback: "password" },
  ];
  for (const endpoint of ["/register", "/login"]) {
    for (const { name, form, feedback } of invalid) {
      await test.step(`${endpoint}: ${name}`, async () => {
        const response = await post(request, endpoint, form);
        expect(response.status()).toBe(400);
        const body = await response.text();
        expect(body).toContain(feedback === "username" ? "Use a username of 3–32 letters, numbers, or underscores." : "Use a password between 12 and 128 characters.");
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
  await expect(page.getByRole("button", { name: /^Start lesson\s*:\s*First characters$/ })).toBeVisible();
  await expect(page.getByText(credentials.username, { exact: true })).toBeVisible();
});
