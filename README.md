# Seedflow

An interactive, source-linked technical graph of how COLDCARD combines device
randomness, required user entropy, BIP39, and BIP32 to generate wallet keys.

Every node and every edge opens its implementation source. Nodes expose the
relevant expression, byte width, and repository path directly in the graph.

## Local development

```bash
npm test
npm run build
npm run serve
```

The local server listens on `http://127.0.0.1:4173` by default. Set `PORT` to
use a different port.

## Deployment

Pushes to `main` are built, tested, and deployed through GitHub Pages using the
workflow in `.github/workflows/pages.yml`.

The site has no runtime dependencies, analytics, cookies, or external scripts.
