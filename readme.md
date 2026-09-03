# Stellar Web Studio — Landing Page

A single-page, cyber-tech styled landing site for a Portuguese web-design studio ("Stellar Web Studio"), targeting small businesses looking for premium websites. Inspired by the Nexis Webflow aesthetic: deep space background, neon cyan/purple glows, and glassmorphism panels.

## Key features

- Sticky navbar with a minimalist PT / EN / RU language switcher (no flags)
- Hero section with abstract animated SVG visual and floating WhatsApp CTA
- 6-card services grid targeting specific business niches (car dealerships, restaurants, medical clinics, law firms, dental clinics, electricians)
- 4-column pricing section with a highlighted premium tier
- WhatsApp-first contact block (no traditional forms)
- Minimal footer (brand, copyright, privacy link only)

## Tech stack

Plain HTML, CSS and vanilla JavaScript — no build step required. Language switching is handled client-side via a small i18n dictionary (`i18n.js`) and `data-i18n` attributes on translatable elements.

## Running locally

Serve the directory with any static server, for example:

```bash
netlify dev --port 8889
```

Then open `http://localhost:8889`.

## Files

- `index.html` — page markup and section structure
- `styles.css` — full visual design system (colors, glass panels, buttons, responsive rules)
- `i18n.js` — translation strings for PT/EN/RU
- `main.js` — language switcher logic
