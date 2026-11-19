# Bloei — figma-make-app

Bijvriendelijke tuinen, daken en terreinen — voor burgers én bedrijven. Zonder gif, met inheemse planten, het hele jaar door.

React 19 + Vite 8 + Tailwind CSS v4 (Figma Make-project), herontworpen als strakke editorial one-pager.

## Live (GitHub Pages)

**https://bbsolutions-hosting-freemiumapps.github.io/bloei-website/**

Pages source: branch `gh-pages`, folder `/ (root)` — in te schakelen via Settings → Pages.

## Development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## Build & deploy (standaardwerkwijze)

```bash
pnpm install --frozen-lockfile
FIGMA_PUBLIC_URL=/bloei-website pnpm build   # → dist/
# push daarna alleen de inhoud van dist/ (+ .nojekyll) naar de gh-pages branch
```

`.figma/make/site.json` bevat `robots.index: true`, dus de gebouwde site is indexeerbaar (geen noindex).

## Structuur

- `index.html` — Vite-shell (title/meta/robots worden geïnjecteerd vanuit `.figma/make/site.json`)
- `src/main.tsx` — entrypoint
- `src/App.tsx` — de volledige pagina
- `src/index.css` — Tailwind v4 + design system (Fraunces / Space Grotesk / Space Mono)
- `public/` — favicon.svg, og-image.svg, robots.txt (gaan mee naar dist/)
- `.figma/make/` — Figma Make-config (site.json, dev.json, assets)
