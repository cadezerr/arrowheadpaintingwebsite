# Arrowhead Painting Website

Website for Arrowhead Painting (arrowheadpaintingkc.com), built for **GoDaddy Node.js Hosting**.

## How it's organized

| What | Where |
|------|-------|
| Page content | `src/pages/` (`index.html` is Home; each other file becomes `/its-name/`) |
| Header, footer, "Ready for a fresh coat?" band | `src/partials/` (edit once, updates every page) |
| Colors, fonts, layout | `src/assets/styles.css` (colors are at the top) |
| Quote form email | `server.js` → `/api/contact` |

`npm run build` combines the pages and partials into `dist/`. `npm start` runs the site. GoDaddy runs both automatically. No packages to install.

## GoDaddy settings

Add this under **Settings → Secrets** in Node.js Hosting so quote requests reach your inbox:

| Name | Value |
|------|-------|
| `CONTACT_FORM_RECIPIENT_EMAIL` | the address that should receive quote requests |

## Publishing a change

After a change is pushed to `main`, select **Pull from GitHub** in Node.js Hosting.
