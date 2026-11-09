import { randomUUID } from "node:crypto";
import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { first, lessonPath, lessons } from "./content-helpers";

export const firstLesson = lessonPath(first);
export const lockedLessons = lessons.slice(1).map(lessonPath);
export const origin = "http://127.0.0.1:4173";

export function account() {
  return { username: `reader_${randomUUID().replaceAll("-", "").slice(0, 20)}`, password: "Test-only long unique passphrase 1!" };
}

export async function register(page: Page, credentials = account()) {
  await page.goto("/register");
  await page.getByLabel("Username", { exact: true }).fill(credentials.username);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page).toHaveURL(/\/lessons$/);
  await expect(page.getByText(credentials.username, { exact: true })).toBeAttached();
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

// Enter the production reader through the native lesson action. Complete the
// self-assessment locally so its real hidden attempt_id is available; do not
// invent an attempt, seed D1, or depend on private localStorage key formats.
export async function startReader(page: Page, lesson = firstLesson) {
  const authored = lessons.find((entry) => lessonPath(entry) === lesson)!;
  await page.goto(lesson);
  if (authored.kind === "revision") {
    expect((await post(page.request, lesson, { intent: "start" })).status()).toBe(303);
    await page.goto(lesson);
    await expect(page.getByRole("region", { name: "Story reader", exact: true })).toBeVisible();
    return (await (await page.request.get(`${lesson}/reader`)).json()).state.attemptId as string;
  }
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
  for (let i = 0; i < authored.newCharacters.length; i++) {
    await page.getByRole("button", { name: "Reveal", exact: true }).click();
    await page.getByRole("button", { name: "Got it", exact: true }).click();
  }
  await expect(page.getByRole("heading", { name: "Deck recognised", exact: true })).toBeVisible();
  const attemptId = await page.locator('input[name="attempt_id"]').inputValue();
  expect(attemptId).not.toBe("");
  expect((await post(page.request, lesson, { intent: "deck-passed", attempt_id: attemptId })).status()).toBe(303);
  await page.goto(lesson);
  await expect(page.getByRole("region", { name: "Story reader", exact: true })).toBeVisible();
  return attemptId;
}

// Protected document routes send new visitors to signup; logout still goes to login.
export function expectLoginRedirect(response: { status(): number; headers(): Record<string, string> }) {
  expect([302, 303]).toContain(response.status());
  expect(response.headers().location).toBe("/register");
}
