import { randomUUID } from "node:crypto";
import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const firstLesson = "/lessons/first-characters";
export const lockedLessons = ["/lessons/people-and-places", "/lessons/everyday-connections"];
export const origin = "http://127.0.0.1:4173";

export function account() {
  return { username: `reader_${randomUUID().replaceAll("-", "").slice(0, 20)}`, password: "test-only long unique passphrase" };
}

export async function register(page: Page, credentials = account()) {
  await page.goto("/register");
  await page.getByLabel("Username", { exact: true }).fill(credentials.username);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page).toHaveURL(/\/lessons$/);
  await expect(page.getByRole("heading", { name: "Your lessons", exact: true })).toBeVisible();
  await expect(page.getByText(credentials.username, { exact: true })).toBeVisible();
  return credentials;
}

export async function login(page: Page, credentials: ReturnType<typeof account>) {
  await page.goto("/login");
  await page.getByLabel("Username", { exact: true }).fill(credentials.username);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/lessons$/);
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
}

export function lessonCard(page: Page, title: string) {
  return page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
}

// Native document requests exercise the same public actions without browser
// constraint validation or disabled UI hiding malicious submissions.
export function post(request: APIRequestContext, path: string, form: Record<string, string> | string, headers: Record<string, string> = {}) {
  return request.post(path, {
    data: typeof form === "string" ? form : new URLSearchParams(form).toString(),
    headers: { Origin: origin, "Content-Type": "application/x-www-form-urlencoded", ...headers },
    maxRedirects: 0,
  });
}

export function expectLoginRedirect(response: { status(): number; headers(): Record<string, string> }) {
  expect([302, 303]).toContain(response.status());
  expect(response.headers().location).toBe("/login");
}
