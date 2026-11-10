import { test, expect } from "@playwright/test";

test("mist visibly drifts at independent depths on desktop and mobile", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(page.locator(".scene-fog")).toHaveCount(2);
    const motion = await page.locator(".scene-fog").evaluateAll((layers) => layers.map((el) => {
      const animation = el.getAnimations()[0];
      animation.pause();
      animation.currentTime = 0;
      const start = new DOMMatrix(getComputedStyle(el).transform);
      animation.currentTime = 3000;
      const end = new DOMMatrix(getComputedStyle(el).transform);
      return { dx: end.m41 - start.m41, opacity: Number(getComputedStyle(el).opacity) };
    }));
    // Visible within seconds, not just a different matrix halfway through a long cycle.
    for (const fog of motion) {
      expect(Math.abs(fog.dx)).toBeGreaterThan(width * 0.015);
      expect(fog.opacity).toBeGreaterThanOrEqual(0.2);
    }
    expect(motion[0].dx * motion[1].dx).toBeLessThan(0);
    const order = await page.locator(".scene-layer").evaluateAll((layers) => layers.map((el) => el.className));
    expect(order).toEqual([
      "scene-layer scene-backdrop", "scene-layer scene-fog scene-fog--back",
      "scene-layer scene-temple", "scene-layer scene-fog scene-fog--front", "scene-layer scene-blossoms",
    ]);
    expect(await page.locator(".scene-temple, .scene-blossoms, .scene-backdrop").evaluateAll((layers) =>
      layers.every((el) => el.getAnimations().length === 0))).toBe(true);
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await page.locator(".scene-fog").evaluateAll((layers) =>
      layers.every((el) => el.getAnimations().length === 0))).toBe(true);
  }
});
