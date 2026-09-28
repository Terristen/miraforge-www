# miraforge-www

Marketing site for Miraforge, an independent software company, and for Miraforge Studio, its first product.

Canonical host: [https://miraforge.com](https://miraforge.com)

`www.miraforge.com` redirects to that host. The redirect is a setting on the host, not part of this build.

## Requirements

Node.js 24 and the npm that ships with it.

## Scripts

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # writes dist/
npm run preview   # serves dist/ on port 4321
```

`npm run build` needs no environment variables. The site is static HTML.

## Deploy

Upload the **contents** of `dist/` to the document root for `miraforge.com`.

The current host is Namecheap shared hosting via cPanel. The document root is assigned by the host. Do not upload `node_modules`, this repository, or a nested `dist` folder.

The handbook is a separate site: [https://docs.miraforge.com](https://docs.miraforge.com).
