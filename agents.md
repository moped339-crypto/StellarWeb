# AGENTS.md

## Architecture

Static, no-build single-page site. There is no bundler, framework, or package.json — `index.html`, `styles.css`, `i18n.js`, and `main.js` are served as-is by Netlify (`netlify.toml` sets `publish = "."`).

## Key files

- `index.html` — all page sections in order: navbar, hero, portfolio/services (6-card grid), pricing (4-column), contact/footer CTA, floating WhatsApp button, footer. Translatable text uses `data-i18n="key"` attributes instead of hardcoded strings.
- `i18n.js` — defines the global `I18N` object with `pt`, `en`, `ru` dictionaries keyed by the same strings used in `data-i18n`. Portuguese is the source of truth; add new keys there first.
- `main.js` — reads `data-i18n` attributes and swaps text on language button click; persists the choice in `localStorage`.
- `styles.css` — design tokens live in `:root` (colors, radius, fonts). Glassmorphism panels use `.card` / `.price-card`; neon buttons use `.btn-neon`.

## Conventions

- Any new visible copy must go through `data-i18n` + all three `I18N` dictionaries, never hardcoded text, to keep PT/EN/RU in sync.
- Keep the color palette limited to the CSS variables in `:root` (`--cyan`, `--purple`, `--bg`, etc.) rather than introducing new colors ad hoc.
- The pricing section intentionally has 4 fixed cards in a specific order (Landing Page, Website Institucional, Website Premium Custom, Manutenção Mensal) — the third card is the visually highlighted tier (`.price-card-featured`).
- No contact form — the site deliberately routes all conversions through WhatsApp links (`https://wa.me/...`). Update the phone number in both `index.html` (contact block) and the floating WhatsApp button when it changes.
