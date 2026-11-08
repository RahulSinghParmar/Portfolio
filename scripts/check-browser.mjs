import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

// Exercise the exported site through Wrangler, not next dev.
// Install once with `npx playwright install chromium`, or set BROWSER_CHANNEL=msedge.
const base = process.argv[2] ?? "http://127.0.0.1:8788";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}),
});
const artifacts = "release-artifacts/browser-review";
await mkdir(artifacts, { recursive: true });
const failures = [];

try {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 820, height: 1180 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "no-preference",
      colorScheme: "light",
    });
    // CPU count alone must no longer disable animations on phones or VMs.
    await context.addInitScript(() =>
      Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 }),
    );
    const page = await context.newPage();
    page.on("pageerror", (error) => failures.push(`${viewport.width}px: ${error.message}`));
    await page.goto(base);
    await page.waitForFunction(
      () =>
        document.documentElement.dataset.motion === "full" &&
        document.querySelector("[data-network-frame]")?.getAttribute("data-enhanced") === "true",
    );
    await page.waitForTimeout(1800);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      true,
      `horizontal overflow at ${viewport.width}px`,
    );
    const canvas = page.locator(".network-signal-canvas");
    const before = await canvas.evaluate((element) => element.toDataURL());
    await page.waitForTimeout(300);
    assert.notEqual(
      await canvas.evaluate((element) => element.toDataURL()),
      before,
      `signal must animate at ${viewport.width}px`,
    );
    assert.equal(
      await page
        .locator(".hero__portrait-image")
        .evaluate((image) => image.complete && image.naturalWidth > 0),
      true,
    );
    await page.screenshot({ path: `${artifacts}/${viewport.width}-light.png` });
    if (viewport.width === 390) {
      const accessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        accessibility.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.map((node) => node.target),
        })),
        [],
        "mobile accessibility violations",
      );
    }
    await page.locator(".theme-control").click();
    await page.locator(".theme-control").click();
    await page.waitForTimeout(500);
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    await page.screenshot({ path: `${artifacts}/${viewport.width}-dark.png` });
    if (viewport.width < 1024) {
      await page.locator(".menu-toggle").press("Enter");
      assert.equal(await page.locator(".menu-toggle").getAttribute("aria-expanded"), "true");
      await page.keyboard.press("Escape");
      assert.equal(await page.locator(".menu-toggle").getAttribute("aria-expanded"), "false");
    }
    await page.locator(".live-status").scrollIntoViewIfNeeded();
    await page.getByRole("heading", { name: "Portfolio responding", exact: true }).waitFor();
    assert.match(await page.locator(".live-status").innerText(), /not an uptime history/);
    await page.screenshot({ path: `${artifacts}/${viewport.width}-status.png` });
    await page.locator(".motion-control").click(); // Auto → On
    await page.locator(".motion-control").click(); // On → Off
    await page.waitForFunction(
      () =>
        document.documentElement.dataset.motion === "reduced" &&
        !document.querySelector("[data-network-frame]")?.hasAttribute("data-enhanced"),
    );
    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.motion === "reduced");
    assert.equal((await page.locator(".motion-control").innerText()).toLowerCase(), "motion / off");
    await context.close();
    console.log(
      `PASS ${viewport.width}px: default animation, low CPU count, portrait, light/dark, overflow, navigation, health, persistent motion off`,
    );
  }
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(base);
  await page.waitForFunction(() => document.documentElement.dataset.motion === "reduced");
  assert.equal(await page.locator("[data-network-frame]").getAttribute("data-enhanced"), null);
  await page.locator(".motion-control").click(); // Auto → explicit On
  await page.waitForFunction(() => document.documentElement.dataset.motion === "full");
  await context.close();
  console.log("PASS reduced-motion Auto and explicit override");

  const monitor = await browser.newContext();
  const monitorPage = await monitor.newPage();
  let source = {
    state: "degraded",
    status: "One service needs attention",
    version: "monitor-test",
    checkedAt: new Date().toISOString(),
    responseTimeMs: 80,
    uptimePercent: null,
    region: null,
    source: "live",
    services: [{ name: "Example lab", state: "degraded", responseTimeMs: 80 }],
  };
  await monitorPage.route("**/api/system-status", (route) => route.fulfill({ json: source }));
  await monitorPage.goto(base);
  await monitorPage.locator(".live-status").scrollIntoViewIfNeeded();
  await monitorPage
    .getByRole("heading", { name: "One service needs attention", exact: true })
    .waitFor();
  assert.equal(await monitorPage.locator(".live-status").getAttribute("data-state"), "degraded");
  source = {
    ...source,
    state: "unavailable",
    status: "Status source temporarily unavailable",
    source: "unavailable",
    services: [],
  };
  await monitorPage.reload();
  await monitorPage.locator(".live-status").scrollIntoViewIfNeeded();
  await monitorPage
    .getByRole("heading", { name: "Status source temporarily unavailable", exact: true })
    .waitFor();
  assert.equal(
    await monitorPage.getByRole("heading", { name: "Portfolio responding", exact: true }).count(),
    0,
  );
  await monitor.close();
  console.log(
    "PASS connected/degraded monitor and unavailable monitor remain distinct from portfolio health",
  );

  const offline = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await offline.newPage();
  await staticPage.goto(base);
  assert.equal(await staticPage.locator("h1").count(), 1);
  assert.ok(await staticPage.locator(".contact-section__email").getAttribute("href"));
  await offline.close();
  console.log("PASS content and contact available without JavaScript");
  assert.deepEqual(failures, [], "uncaught browser errors");
} finally {
  await browser.close();
}
