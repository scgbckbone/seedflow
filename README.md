# Seedflow

An interactive, source-linked visualization of how COLDCARD combines device
randomness, required user entropy, BIP39, and BIP32 to generate wallet keys.

Every edge in the graph opens the relevant firmware source, technical standard,
or documentation. Selecting a node explains its role and shows the exact input
or transformation it represents.

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

