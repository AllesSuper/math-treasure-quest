# Contributing to Mathe-Schatzreise

First of all: thank you! 💛 Every contribution — code, translations, ideas, bug
reports — helps make math a little friendlier for children.

This project is deliberately small, dependency-free and beginner-friendly. You
do not need a complex toolchain to help.

## Ways to contribute

- 🐛 **Report a bug** using the bug report template.
- 💡 **Suggest a feature** using the feature request template.
- 🌍 **Add or improve a translation** in the `I18N` dictionary in `app.js`.
- 🎨 **Improve the UI/UX** while keeping it touch-first and child-friendly.
- 📝 **Improve the docs**.

## Getting started

```bash
git clone https://github.com/USERNAME/math-treasure-quest.git
cd math-treasure-quest
npm start      # or: python3 -m http.server 8080
```

Open `http://localhost:8080` in your browser.

## Project principles

Please keep these in mind for any change:

1. **Vanilla first.** Plain HTML, CSS and JavaScript. No frameworks or build
   steps unless there is a very strong, discussed reason.
2. **Zero dependencies at runtime.** The app must keep working offline with no
   external requests, trackers or ads.
3. **Privacy by default.** Nothing about the child ever leaves the device.
4. **Accessible and touch-first.** Large targets, high contrast, keyboard
   support, `prefers-reduced-motion` respected.
5. **Math stays in range.** Addition sums ≤ 100, subtraction never negative in
   normal play, multiplication within 1×1–10×11.
6. **German is the fallback language.** Missing translation keys must fall back
   to German.

## Adding a translation

1. Find the `I18N` object in `app.js`.
2. Copy the `de` block and translate every value (keep the keys unchanged).
3. Add your language to the `LANGUAGES` array (code, native label, flag, `dir`).
4. Run `npm test` to make sure nothing broke, then test in the browser.

## Code style

- Run `npm run format` (Prettier) before committing.
- Write **code comments in English**.
- Keep functions small and readable.

## Tests

Run the lightweight Node test suite:

```bash
npm test
```

These tests verify that generated tasks always stay within the allowed ranges.
Please add a test when you change math generation.

## Commit messages

We loosely follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Swedish translation
fix: prevent negative results in timed subtraction
docs: clarify iPad install steps
chore: format with prettier
```

## Pull requests

1. Fork the repo and create a descriptive branch (`feat/parent-dashboard`).
2. Make focused changes and run `npm test` + `npm run format`.
3. Fill in the pull request template.
4. Be kind in review — we are all here for the kids. 🙂

## Releases

Maintainers cut releases with semantic version tags (`vMAJOR.MINOR.PATCH`) and
update `CHANGELOG.md`. Example:

```bash
git tag -a v1.1.0 -m "Add sound effects"
git push origin v1.1.0
```
