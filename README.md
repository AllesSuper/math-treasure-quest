# 🗺️ Math Treasure Quest

> **Turn 2nd-grade math practice into a treasure-hunting adventure — right on the iPad, fully offline, no ads, no tracking.**

[![Deploy to GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deploy-blue?logo=githubpages)](https://github.com/USERNAME/math-treasure-quest/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8?logo=pwa)](manifest.json)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-f7df1e?logo=javascript&logoColor=black)](app.js)
[![No dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)

Math Treasure Quest (in-app name: **Mathe-Schatzreise**) is a playful, offline-capable web
app that helps young children practice **addition, subtraction and the times
tables**. Kids travel across an adventure map, solve one task per station, and
open a glittering treasure chest at the end of every run.

The interface speaks the child's language (16 languages, German first) while the
math stays universal. Built with **plain HTML, CSS and JavaScript** — no
frameworks, no build step, no external requests.

---

## 🔗 Live demo

**Play it here:** `https://USERNAME.github.io/math-treasure-quest/`

> Replace `USERNAME` with your GitHub username once GitHub Pages is enabled
> (see the deployment guide below).

---

## 📸 Screenshots

> Add your own screenshots or a short GIF here once you run the app.

| Language picker | Adventure map | Treasure reward |
| --------------- | ------------- | --------------- |
| _screenshot_    | _screenshot_  | _screenshot_    |

```
docs/
  screenshot-language.png
  screenshot-game.png
  screenshot-treasure.png
```

---

## ✨ Feature overview

- 🗺️ **Adventure map** with a moving traveler and visible journey progress.
- 🧮 **Three math modes** plus a colorful mixed mode.
- 🎯 **Adaptive difficulty** that grows and eases with the child.
- 💡 **Helpful hints** appear after a mistake — never punishing, always guiding.
- ⭐ **Stars, 🔥 streaks, 🪙 coins, 🎖️ badges** and a 💎 **random treasure** each run.
- ⏱️ **Optional timer mode** and ⚡ **quick mode** (10 tasks).
- 🌍 **16 languages**, German first; choice saved on the device.
- 📱 **Installable PWA** — add to the iPad home screen and play offline.
- 🎨 **Premium cartoon look** built only from original CSS/SVG/HTML graphics.
- 🔒 **No backend, no login, no tracking, no ads, no external APIs.**

---

## 💛 Why this project exists

Most free math games for kids are buried in ads, demand accounts, or quietly
track children. Parents and teachers deserve something better: a calm, friendly,
self-contained tool that respects the child and the family.

Mathe-Schatzreise is intentionally tiny and transparent. Anyone can read every
line, host it for free, and trust that nothing is happening behind the scenes.
It is a gift to families, classrooms, and the open-source community.

---

## 🎓 Educational benefits

- Reinforces **number bonds to 100** through repeated, varied practice.
- Builds **multiplication fluency** with the 1×1 to 10×11 tables.
- Encourages a **growth mindset**: mistakes lead to hints, not dead ends.
- Uses **immediate, encouraging feedback** to keep motivation high.
- Short ~15-minute runs fit a child's attention span; quick mode fits a spare
  five minutes.

---

## 🧮 Supported math modes

| Mode               | Range                                   | Notes                                   |
| ------------------ | --------------------------------------- | --------------------------------------- |
| ➕ Addition        | 2 or 3 numbers, each 0–100, sum ≤ 100   | Sums never exceed 100.                  |
| ➖ Subtraction     | 0–100                                   | Result is never negative in normal play.|
| ✖️ Multiplication  | 1×1 up to 10×11                         | First factor 1–10, second factor 1–11.  |
| 🌈 Mixed           | All of the above                        | Randomly combined.                      |

---

## 📲 Install on iPad (Add to Home Screen)

1. Open the live demo URL in **Safari** on the iPad.
2. Tap the **Share** icon (the square with an upward arrow).
3. Choose **"Add to Home Screen"**.
4. Confirm the name and tap **Add**.
5. Launch **Mathe-Schatzreise** from the home screen — it runs full screen and
   works offline after the first load.

---

## 🛠️ Local development

No build step and no dependencies are required. Any static file server works.

```bash
# Clone the repository
git clone https://github.com/USERNAME/math-treasure-quest.git
cd math-treasure-quest

# Option A: Node (uses the bundled npm script)
npm start            # serves the app at http://localhost:8080

# Option B: Python (no Node required)
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

Useful scripts (see `package.json`):

```bash
npm start      # serve the app locally
npm test       # run the math range/validation tests
npm run format # format files with Prettier
```

> Service workers require `http://localhost` or HTTPS. Opening `index.html`
> directly via `file://` disables offline caching but the game still runs.

---

## 🗂️ Project structure

```
math-treasure-quest/
├── index.html              # App shell and all screens
├── styles.css              # Cartoon theme, layout, animations
├── app.js                  # Game engine, i18n, math generators
├── manifest.json           # PWA metadata
├── service-worker.js       # Offline-first cache
├── icons/
│   ├── favicon.svg         # Original vector icon
│   ├── icon-192.png        # PWA icon
│   ├── icon-512.png        # PWA icon
│   └── icon-maskable-512.png
├── tests/
│   └── math.test.js        # Range + validation unit tests (Node)
├── .github/
│   ├── workflows/
│   │   ├── pages.yml        # Deploy static site to GitHub Pages
│   │   └── quality.yml      # Lint/validate + run tests
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   └── feature_request.yml
│   └── pull_request_template.md
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
├── ROADMAP.md
├── package.json
├── .gitignore
└── .editorconfig
```

---

## ♿ Accessibility notes

- Large touch targets (≥ 64 px) designed for small hands.
- High-contrast text and readable, system-friendly font sizing.
- Full **keyboard support**: number keys, Backspace, Enter (check) and Escape
  (pause).
- Semantic landmarks, `aria-live` feedback regions and visible focus styles.
- Respects `prefers-reduced-motion` for children sensitive to animation.
- Right-to-left layout support (e.g. Arabic).

---

## 📴 Offline & PWA notes

- A service worker pre-caches the full app shell on first load.
- After that, the game works with **no network connection at all**.
- Update the `CACHE_VERSION` constant in `service-worker.js` when you change
  cached assets to refresh clients.
- Progress (coins, treasures, badges, language) is stored locally in
  `localStorage` — nothing leaves the device.

---

## 🚀 Deploy to GitHub Pages

This repository ships with a GitHub Actions workflow that publishes the static
root of the project to GitHub Pages.

1. Push the repository to GitHub.
2. Open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The `pages.yml` workflow runs on every push to `main` and deploys the site.
4. Your app appears at `https://USERNAME.github.io/math-treasure-quest/`.

---

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for the full plan. Highlights:

- 🔊 Sound effects and gentle music
- 👪 Parent dashboard
- 🌍 More adventure worlds
- 📜 Printable certificates
- 🗣️ Expanded multilingual content
- 📊 Difficulty analytics
- 🏫 Classroom mode

---

## 🤝 Contributing

Contributions are warmly welcome! Whether it is a translation, a bug fix, or a
new idea, please read [CONTRIBUTING.md](CONTRIBUTING.md) and our
[Code of Conduct](CODE_OF_CONDUCT.md) first.

---

## 📄 License

Released under the [MIT License](LICENSE). Free to use, share, remix and host.

---

## ⭐ A small ask

If Mathe-Schatzreise helps a child you know enjoy math a little more, consider
giving the project a star. It helps other parents and teachers discover it — and
it genuinely makes the maintainers smile. Thank you for stopping by! 💛
