import { expect, test, type Page } from "@playwright/test";
import { account, post } from "./helpers";

async function fields(page: Page) {
  await page.goto("/register");
  return { username: page.getByLabel("Username", { exact: true }), password: page.getByLabel("Password", { exact: true }), submit: page.getByRole("button", { name: "Create account", exact: true }) };
}

function requestedUsername(body: string | null) { return new URLSearchParams(body ?? "").get("username")!; }

test("untouched slots stay empty; editing shows one priority rule and password valid has no success text", async ({ page }) => {
  const form = await fields(page);
  await expect(page.locator("#username-message")).toBeEmpty();
  await expect(page.locator("#password-message")).toBeEmpty();
  await expect(form.submit).toBeDisabled();
  await expect(form.username).toHaveAttribute("aria-describedby", "username-message");
  await expect(form.password).toHaveAttribute("aria-describedby", "password-message");
  for (const [value, message] of [["a !", "No spaces."], ["!", "Use 3–32 characters."], ["abc!", "Use letters, numbers or _."], ["", "Enter a username."]]) {
    await form.username.fill(value);
    await expect(page.locator("#username-message")).toHaveText(message);
    await expect(form.username).toHaveAttribute("aria-invalid", "true");
  }
  for (const [value, message] of [["a", "Use at least 8 characters."], ["lower1!!", "Add an uppercase letter."], ["UPPER1!!", "Add a lowercase letter."], ["Garden!!", "Add a number."], ["Garden12", "Add a symbol."], ["x".repeat(129), "Use at most 128 characters."], ["", "Enter a password."]]) {
    await form.password.fill(value);
    await expect(page.locator("#password-message")).toHaveText(message);
    await expect(form.password).toHaveAttribute("aria-invalid", "true");
  }
  await form.password.fill("Garden1!");
  await expect(page.locator("#password-message")).toBeEmpty();
  await expect(form.password).toHaveAttribute("data-state", "valid");
  await expect(form.password).not.toHaveAttribute("aria-invalid", "true");
});

test("only locally valid debounced usernames are checked; edits revoke availability immediately", async ({ page }) => {
  const requests: string[] = [];
  await page.route("**/availability", async (route) => {
    const username = requestedUsername(route.request().postData());
    requests.push(username);
    await route.fulfill({ json: { username, available: true } });
  });
  const form = await fields(page);
  await form.username.fill("a !");
  await page.waitForTimeout(450);
  expect(requests).toEqual([]);
  await form.password.fill("Garden1!");
  await form.username.fill("reader_one");
  await form.username.fill("reader_two");
  await form.username.fill("reader_three");
  await expect(page.locator("#username-message")).toHaveText("✓ Username available");
  expect(requests).toEqual(["reader_three"]);
  await expect(form.submit).toBeEnabled();
  await form.username.fill("reader_four");
  await expect(form.submit).toBeDisabled();
  await expect(form.username).toHaveAttribute("data-state", "neutral");
  await expect(page.locator("#username-message")).toHaveText("Checking availability…");
  await expect(form.username).toHaveAttribute("aria-busy", "true");
  await expect(page.locator("#username-message")).toHaveText("✓ Username available");
});

test("late replies cannot replace the current username status, even if cancellation is ignored", async ({ page }) => {
  await page.addInitScript(() => {
    const realFetch = window.fetch.bind(window);
    window.fetch = (input, init) => realFetch(input, String(input) === "/availability" ? { ...init, signal: undefined } : init);
  });
  let releaseOld: (() => void) | undefined;
  const oldHeld = new Promise<void>((resolve) => { releaseOld = resolve; });
  await page.route("**/availability", async (route) => {
    const username = requestedUsername(route.request().postData());
    if (username === "old_reader") await oldHeld;
    await route.fulfill({ json: { username, available: username !== "old_reader" } });
  });
  const form = await fields(page);
  await form.password.fill("Garden1!");
  const oldRequest = page.waitForRequest("**/availability");
  await form.username.fill("old_reader");
  await oldRequest;
  await form.username.fill("new_reader");
  await expect(page.locator("#username-message")).toHaveText("✓ Username available");
  const oldResponse = page.waitForResponse((response) => response.url().endsWith("/availability") && requestedUsername(response.request().postData()) === "old_reader");
  releaseOld!();
  await oldResponse;
  await expect(form.username).toHaveValue("new_reader");
  await expect(page.locator("#username-message")).toHaveText("✓ Username available");
  await expect(form.submit).toBeEnabled();
  await form.username.fill("old_reader");
  await expect(form.submit).toBeDisabled();
  await expect(page.locator("#username-message")).toHaveText("Username taken");
});

test("failed and malformed checks are neutral, block signup, and offer a keyboard-usable retry", async ({ page }) => {
  let checks = 0;
  await page.route("**/availability", async (route) => {
    checks++;
    const username = requestedUsername(route.request().postData());
    if (checks === 1) await route.fulfill({ status: 503, json: { error: "unavailable" } });
    else if (checks === 2) await route.fulfill({ json: { username: "wrong_reader", available: true } });
    else await route.fulfill({ json: { username, available: true } });
  });
  const form = await fields(page);
  await form.username.fill("retry_reader");
  await form.password.fill("Garden1!");
  const retry = page.getByRole("button", { name: "Could not check. Try again.", exact: true });
  await expect(retry).toBeVisible();
  await expect(form.submit).toBeDisabled();
  await expect(form.username).toHaveAttribute("data-state", "neutral");
  await expect(form.username).not.toHaveAttribute("aria-invalid", "true");
  await retry.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => checks).toBe(2);
  await expect(retry).toBeVisible();
  await retry.click();
  await expect(page.locator("#username-message")).toHaveText("✓ Username available");
  await expect(form.submit).toBeEnabled();
  expect(checks).toBe(3);
});

test("a hung check times out with an explicit retry instead of an endless pending state", async ({ page }) => {
  await page.clock.install();
  let checks = 0;
  let release: (() => void) | undefined;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/availability", async (route) => {
    checks++;
    const username = requestedUsername(route.request().postData());
    if (checks === 1) await held;
    await route.fulfill({ json: { username, available: true } }).catch(() => {});
  });
  const form = await fields(page);
  await form.password.fill("Garden1!");
  const requestStarted = page.waitForRequest("**/availability");
  await form.username.fill("timeout_reader");
  await page.clock.runFor(400);
  await requestStarted;
  await page.clock.fastForward(8_100);
  const retry = page.getByRole("button", { name: "Could not check. Try again.", exact: true });
  await expect(retry).toBeVisible();
  await expect(form.submit).toBeDisabled();
  await page.clock.fastForward(20_000);
  expect(checks).toBe(1);
  release!();
  await retry.click();
  await page.clock.runFor(400);
  await expect(page.locator("#username-message")).toHaveText("✓ Username available");
  await expect(form.submit).toBeEnabled();
});

test("authoritative registration conflict uses the existing username slot and revokes client confirmation", async ({ page, request }) => {
  const credentials = { ...account(), password: "Garden1!" };
  const form = await fields(page);
  await form.username.fill(credentials.username);
  await form.password.fill(credentials.password);
  await expect(page.locator("#username-message")).toHaveText("✓ Username available");
  expect((await post(request, "/register", { ...credentials, username: credentials.username.toUpperCase() })).status()).toBe(303);
  await form.submit.click();
  await expect(page.locator("#username-message")).toHaveText("Username taken");
  await expect(form.username).toHaveAttribute("aria-invalid", "true");
  await expect(form.submit).toBeDisabled();
  await form.password.fill("Garden12!");
  await expect(page.locator("#username-message")).toHaveText("Username taken");
  await expect(form.submit).toBeDisabled();
  await expect(page.locator("body")).not.toContainText(credentials.password);
});

test("availability API rejects cross-origin, unbounded, malformed and non-POST requests without caching", async ({ request }) => {
  const username = account().username;
  const success = await post(request, "/availability", { username });
  expect(success.status()).toBe(200);
  expect(await success.json()).toEqual({ username, available: true });
  expect(success.headers()["cache-control"]).toBe("no-store");
  expect(success.headers()["access-control-allow-origin"]).toBeUndefined();
  for (const form of ["", "username=ab", "username=bad+name", "username=reader&username=other", "username=reader&extra=x", `username=${"a".repeat(33)}`]) {
    const result = await post(request, "/availability", form);
    expect(result.status()).toBe(400);
    expect(result.headers()["cache-control"]).toBe("no-store");
    expect(await result.json()).not.toHaveProperty("available");
  }
  const tooLarge = await post(request, "/availability", { username: "a".repeat(5000) });
  expect(tooLarge.status()).toBe(413);
  expect(tooLarge.headers()["cache-control"]).toBe("no-store");
  for (const headers of [{ Origin: "" }, { Origin: "https://attacker.invalid" }, { "Sec-Fetch-Site": "cross-site" }] as Record<string, string>[]) {
    expect([400, 403]).toContain((await post(request, "/availability", { username }, headers)).status());
  }
  const get = await request.get("/availability");
  expect(get.status()).toBe(405);
  expect(get.headers().allow).toBe("POST");
  expect(get.headers()["cache-control"]).toBe("no-store");
});
