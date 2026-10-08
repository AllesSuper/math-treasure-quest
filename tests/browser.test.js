"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { chromium, firefox, webkit } = require("playwright");
const root = path.join(__dirname, "..");
let checks = 0;
function check(value, message) {
  assert.ok(value, message);
  checks++;
}
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
const server = http.createServer((request, response) => {
  const file = path.resolve(
    root,
    "." +
      new URL(request.url, "http://localhost").pathname.replace(
        /\/$/,
        "/index.html",
      ),
  );
  if (!file.startsWith(root + path.sep)) {
    response.writeHead(403).end();
    return;
  }
  fs.readFile(file, (error, data) => {
    response.writeHead(error ? 404 : 200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
    });
    response.end(error ? "Not found" : data);
  });
});

(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url =
    process.env.TEST_BASE_URL || "http://127.0.0.1:" + server.address().port;
  const engine = process.env.TEST_BROWSER || "chromium";
  const browser = await { chromium, firefox, webkit }[engine].launch({
    headless: true,
    ...(process.env.BROWSER_CHANNEL
      ? { channel: process.env.BROWSER_CHANNEL }
      : {}),
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 768 },
      reducedMotion: "reduce",
      hasTouch: true,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url);
    await page
      .locator("#language-grid button")
      .filter({ hasText: "Deutsch" })
      .click();
    await page.evaluate(() => {
      localStorage.setItem(
        "ms_settings",
        JSON.stringify({
          sound: false,
          timer: false,
          quick: false,
          blitz: false,
          choices: true,
        }),
      );
      localStorage.setItem(
        "ms_progress",
        JSON.stringify({
          coins: 500,
          stars: 77,
          treasures: 3,
          badges: ["first_treasure"],
          collection: ["existing-treasure"],
          bestStreak: 6,
          avgMs: 9000,
          totalCorrect: 9,
          inventory: { joker: 2, fifty: 2, time: 2, shield: 2 },
          buddies: ["kid"],
          buddy: "kid",
          learning: {
            div: {
              level: 3,
              successes: 0,
              attempts: 20,
              correct: 15,
              avgMs: 7000,
            },
          },
          customFutureField: "keep",
        }),
      );
    });
    await page.reload();
    await page.clock.install();
    const saved = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem("ms_progress")));
    check(
      (await page.locator("#menu-coins").textContent()) === "500",
      "old coins retained",
    );
    check(
      (await saved()).customFutureField === "keep",
      "unknown progress retained",
    );
    check((await saved()).learning.div.level === 3, "learning retained");
    await page.locator('#screen-menu [data-action="go-settings"]').click();
    check(
      !(await page.locator("#toggle-timer").isChecked()) &&
        !(await page.locator("#toggle-blitz").isChecked()),
      "optional timing",
    );
    await page
      .locator("#settings-language-grid button")
      .filter({ hasText: "English" })
      .click();
    check(
      (await page.locator("html").getAttribute("lang")) === "en",
      "language navigation",
    );
    await page
      .locator("#settings-language-grid button")
      .filter({ hasText: "Deutsch" })
      .click();
    await page.locator('#screen-settings [data-action="go-menu"]').click();
    await page.locator('#screen-menu [data-action="go-shop"]').click();
    const oldCoins = (await saved()).coins;
    await page
      .locator(".shop-item")
      .filter({ hasText: "Joker" })
      .locator(".shop-buy")
      .click();
    check(
      (await saved()).coins < oldCoins && (await saved()).inventory.joker === 3,
      "shop purchase",
    );
    await page.locator(".buddy-card").filter({ hasText: "Fuchs" }).click();
    check((await saved()).buddy === "fox", "buddy purchase and equip");
    await page.locator('[data-action="close-shop"]').click();

    async function start(mode, quick, diff = "adaptive", timer = false) {
      if (
        await page
          .locator("#screen-summary")
          .evaluate((el) => el.classList.contains("is-active"))
      )
        await page.locator('#screen-summary [data-action="go-menu"]').click();
      await page.locator('#screen-menu [data-action="go-modes"]').click();
      await page.locator('[data-mode="' + mode + '"]').click();
      await page.locator('[data-diff="' + diff + '"]').click();
      if ((await page.locator("#toggle-quick-modes").isChecked()) !== quick)
        await page
          .locator("#toggle-quick-modes")
          .locator("xpath=ancestor::label")
          .click();
      if ((await page.locator("#toggle-timer-modes").isChecked()) !== timer)
        await page
          .locator("#toggle-timer-modes")
          .locator("xpath=ancestor::label")
          .click();
      await page.locator('#screen-modes [data-action="start-run"]').click();
    }
    async function current() {
      const text = await page.locator("#game-question").textContent();
      const numbers = text.match(/\d+/g).map(Number);
      const type = text.includes("÷")
        ? "div"
        : text.includes("×")
          ? "mul"
          : text.includes("−")
            ? "sub"
            : "add";
      const answer =
        type === "div"
          ? numbers[0] / numbers[1]
          : type === "mul"
            ? numbers[0] * numbers[1]
            : type === "sub"
              ? numbers[0] - numbers[1]
              : numbers.reduce((sum, n) => sum + n, 0);
      return { type, numbers, answer };
    }
    async function solve() {
      const q = await current();
      await page
        .locator("#choices .choice")
        .filter({ hasText: new RegExp("^" + q.answer + "$") })
        .tap();
      await page.clock.runFor(800);
      return q;
    }
    async function quit() {
      await page.locator('[data-action="pause"]').click();
      await page.locator('[data-action="quit"]').click();
    }
    for (const [mode, quick] of [
      ["mix", false],
      ["mix", true],
      ["add", true],
      ["sub", true],
      ["mul", true],
      ["div", true],
    ]) {
      await start(mode, quick);
      check(
        !(await page.locator("#timer-ring").isVisible()) &&
          !(await page.locator("#game-timer-chip").isVisible()) &&
          !(await page.locator("#blitz-tag").isVisible()),
        "untimed task hides all timer UI",
      );
      const total = quick ? 10 : 25;
      check(
        (await page.locator("#map-progress").textContent()).includes(
          "von " + total,
        ),
        "round length",
      );
      const counts = { add: 0, sub: 0, mul: 0, div: 0 };
      for (let i = 0; i < total; i++) {
        const q = await solve();
        counts[q.type]++;
        if (i === 4)
          check(
            (await page.locator("#mascot-bubble").textContent()).includes("5"),
            "positive milestone",
          );
      }
      check(
        await page
          .locator("#screen-summary")
          .evaluate((el) => el.classList.contains("is-active")),
        "round completion",
      );
      check(
        (await page.locator("#sum-accuracy").textContent()) === "100%",
        "accuracy",
      );
      if (mode === "mix")
        check(
          Math.max(...Object.values(counts)) -
            Math.min(...Object.values(counts)) <=
            1,
          "mixed UI balance",
        );
      else check(counts[mode] === total, "individual mode");
      await page.locator("#chest").click();
      await page.clock.runFor(800);
      check(
        await page.locator("#treasure-reveal").isVisible(),
        "treasure reveal",
      );
    }
    check(
      (await saved()).collection.includes("existing-treasure"),
      "old treasure retained",
    );
    check(
      (await saved()).badges.includes("first_treasure"),
      "old badge retained",
    );
    await page.locator('#screen-summary [data-action="go-menu"]').click();
    await start("div", false, "hard");
    for (let i = 0; i < 4; i++) await solve();
    const q = await current();
    await page
      .locator("#choices .choice")
      .filter({ hasNotText: new RegExp("^" + q.answer + "$") })
      .first()
      .click();
    check(
      (await page.locator("#map-progress").textContent()).includes("Station 2"),
      "three-station setback",
    );
    check(
      (await page.locator("#hint").textContent()).includes(
        q.numbers[1] + " × " + q.answer + " = " + q.numbers[0],
      ),
      "inverse division solution",
    );
    const attempts = (await saved()).learning.div.attempts;
    await page.locator('[data-action="pause"]').click();
    await page.clock.runFor(40000);
    await page.locator('[data-action="resume"]').click();
    check(
      (await saved()).learning.div.attempts === attempts,
      "solution pause causes no duplicate failure",
    );
    await page.locator(".choice--continue").click();
    check(
      (await page.locator("#map-progress").textContent()).includes("Station 3"),
      "continue after explanation",
    );
    for (let i = 0; i < 2; i++) await solve();
    await page.locator('.powerup[aria-label^="Schutzschild"]').click();
    const beforeShield = await page.locator("#map-progress").textContent();
    const shieldQ = await current();
    await page
      .locator("#choices .choice")
      .filter({ hasNotText: new RegExp("^" + shieldQ.answer + "$") })
      .first()
      .click();
    check(
      (await page.locator("#map-progress").textContent()) === beforeShield,
      "shield prevents setback",
    );
    await page.locator(".choice--continue").click();
    const beforeJoker = (await saved()).learning.div.attempts;
    await page.locator('.powerup[aria-label^="Joker"]').click();
    await page.clock.runFor(800);
    check(
      (await saved()).learning.div.attempts === beforeJoker,
      "joker does not inflate learning",
    );
    await quit();
    for (const mode of ["add", "sub", "mul", "div", "mix"]) {
      await start(mode, true, "adaptive", true);
      await page.locator("#game-timer-chip").waitFor({ state: "visible" });
      await page.locator("#timer-ring").waitFor({ state: "visible" });
      check(
        (await page.locator("#game-timer-chip").isVisible()) &&
          (await page.locator("#timer-ring").isVisible()),
        "countdown visible in " +
          mode +
          ": " +
          (await page.evaluate(() =>
            JSON.stringify({
              chip: document.getElementById("game-timer-chip").outerHTML,
              ringHidden: document.getElementById("timer-ring").hidden,
              settings: JSON.parse(localStorage.getItem("ms_settings")),
            }),
          )),
      );
      const initial = Number(await page.locator("#game-timer").textContent());
      await page.clock.runFor(1100);
      const remaining = Number(await page.locator("#game-timer").textContent());
      check(
        remaining < initial &&
          remaining === Number(await page.locator("#timer-num").textContent()),
        "countdown ticks in " + mode,
      );
      await solve();
      check(
        await page.locator("#game-timer-chip").isVisible(),
        "countdown on next task in " + mode,
      );
      await quit();
    }
    await start("div", false, "hard", true);
    const divisionTime = Number(await page.locator("#timer-num").textContent());
    check(divisionTime >= 10 && divisionTime <= 30, "actual division timer");
    await quit();
    await start("mul", false, "hard", true);
    let initialTime = Number(await page.locator("#timer-num").textContent());
    check(initialTime >= 6 && initialTime <= 20, "actual multiplication timer");
    await page.locator('.powerup[aria-label^="50:50"]').click();
    check((await page.locator("#choices .is-faded").count()) === 2, "50:50");
    const starsBefore = (await saved()).stars;
    await page.locator(".powerup--star").click();
    await page.clock.runFor(100);
    check((await saved()).stars === starsBefore - 3, "star time price");
    check(
      Number(await page.locator("#timer-num").textContent()) ===
        initialTime + 10,
      "star extra time",
    );
    await page.locator('.powerup[aria-label^="Extra-Zeit"]').click();
    await page.clock.runFor(100);
    check(
      Number(await page.locator("#timer-num").textContent()) ===
        initialTime + 15,
      "coin extra time",
    );
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await page.clock.runFor(5000);
    await page.locator('[data-action="resume"]').click();
    check(
      Number(await page.locator("#timer-num").textContent()) ===
        initialTime + 15,
      "purchased time survives pause",
    );
    await page.clock.runFor(40000);
    check(await page.locator("#hint").isVisible(), "timeout shows solution");
    await quit();
    // Cancel a pending task transition when navigating away immediately.
    await start("add", true);
    const transitionQ = await current();
    await page
      .locator("#choices .choice")
      .filter({ hasText: new RegExp("^" + transitionQ.answer + "$") })
      .press("Enter");
    await quit();
    await page.clock.runFor(1000);
    check(
      await page
        .locator("#screen-menu")
        .evaluate((el) => el.classList.contains("is-active")),
      "safe navigation during transition",
    );
    const learningBeforeReload = JSON.stringify((await saved()).learning);
    await page.reload();
    check(
      JSON.stringify((await saved()).learning) === learningBeforeReload,
      "persisted learning reload",
    );
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    check(
      await page.evaluate(() => !!navigator.serviceWorker.controller),
      "service worker controls page",
    );
    await context.setOffline(true);
    await page.reload();
    await start("div", true, "easy", false);
    await solve();
    check(
      await page
        .locator("#screen-game")
        .evaluate((el) => el.classList.contains("is-active")),
      "offline game works",
    );
    fs.mkdirSync(path.join(root, ".cache"), { recursive: true });
    await page.screenshot({
      path: path.join(root, ".cache", "tablet-game.png"),
      fullPage: true,
    });
    await quit();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#screen-menu [data-action="go-modes"]').click();
    check(
      await page.locator('[data-mode="div"]').isVisible(),
      "division on mobile",
    );
    check(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "no horizontal mobile overflow",
    );
    await page.screenshot({
      path: path.join(root, ".cache", "mobile-modes.png"),
      fullPage: true,
    });
    check(errors.length === 0, "no browser errors: " + errors.join("; "));
    await context.close();
    // Fresh installation uses untimed practice by default.
    const fresh = await browser.newContext();
    const freshPage = await fresh.newPage();
    await freshPage.goto(url);
    await freshPage
      .locator("#language-grid button")
      .filter({ hasText: "Deutsch" })
      .click();
    await freshPage.locator('#screen-menu [data-action="go-settings"]').click();
    check(
      !(await freshPage.locator("#toggle-timer").isChecked()) &&
        !(await freshPage.locator("#toggle-blitz").isChecked()),
      "new installation defaults",
    );
    await freshPage.evaluate(() => {
      localStorage.setItem(
        "ms_settings",
        JSON.stringify({ timer: true, blitz: true, sound: false }),
      );
      localStorage.setItem("ms_progress", "{broken");
    });
    await freshPage.reload();
    await freshPage.locator('#screen-menu [data-action="go-settings"]').click();
    check(
      (await freshPage.locator("#toggle-timer").isChecked()) &&
        (await freshPage.locator("#toggle-blitz").isChecked()),
      "existing timer preferences retained",
    );
    check(
      (await freshPage.locator("#menu-coins").textContent()) === "0",
      "corrupt storage recovers",
    );
    freshPage.once("dialog", (dialog) => dialog.accept());
    await freshPage.locator('[data-action="reset"]').click();
    const reset = await freshPage.evaluate(() =>
      JSON.parse(localStorage.getItem("ms_progress")),
    );
    check(
      reset.coins === 0 &&
        reset.stars === 0 &&
        Object.values(reset.learning).every((r) => r.level === 1),
      "explicit reset clears learning and rewards",
    );
    await fresh.close();
    const privateContext = await browser.newContext();
    await privateContext.addInitScript(() => {
      Storage.prototype.getItem = () => {
        throw Error("storage unavailable");
      };
      Storage.prototype.setItem = () => {
        throw Error("storage unavailable");
      };
    });
    const privatePage = await privateContext.newPage();
    await privatePage.goto(url);
    await privatePage
      .locator("#language-grid button")
      .filter({ hasText: "Deutsch" })
      .click();
    await privatePage.locator('#screen-menu [data-action="go-modes"]').click();
    await privatePage
      .locator('#screen-modes [data-action="start-run"]')
      .click();
    check(
      (await privatePage.locator("#choices .choice").count()) >= 4,
      "game without storage",
    );
    await privateContext.close();
    console.log(
      checks +
        " browser checks passed in " +
        engine +
        (process.env.BROWSER_CHANNEL
          ? " (" + process.env.BROWSER_CHANNEL + ")"
          : "") +
        " " +
        browser.version() +
        ": rounds, learning, rewards, shop, navigation, pause, timeout, offline and mobile.",
    );
  } finally {
    await browser.close();
  }
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => server.close());
