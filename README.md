# Vantage Roof Repairs

Static multi-page website. No build step: every page is plain HTML in its own folder, sharing `assets/style.css` and `assets/site.js`.

- Contact details (phone, WhatsApp, email, hours, address, Google review link, form endpoint) live in the `CONFIG` block at the top of `assets/site.js`.
- Photos are in `assets/img` as webp. Hero slideshow images are the `slide-*.webp` files.
- Deploy anywhere that serves static files (Vercel config included).

## Build note (speed)
`assets/style.css` and `assets/site.js` are the readable sources. Pages load the minified
`assets/style.min.css` and `assets/site.min.js` (generated with esbuild: `esbuild assets/style.css --minify
--outfile=assets/style.min.css`, same for `site.js`). Re-run these after editing the sources, and bump the `?v=`
number so browsers fetch the new files. Fonts (Fraunces, Manrope) are self-hosted in `assets/*.woff2`.
