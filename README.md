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

The site is static. Namecheap shared hosting serves it with Apache. Deploy from this repository with cPanel Git Version Control.

1. In cPanel, open **Git Version Control** and clone this repository **outside** `public_html`. Deploying the repository itself into the document root would publish the source.
2. Confirm the account can run Node.js 24 and that `npm` is on the shell PATH used by Git deploy. This project does not build on older Node.
3. If `miraforge.com` is not the primary domain, edit `DEPLOYPATH` in `.cpanel.yml` to that domain's document root. The default is `$HOME/public_html`.
4. Click **Deploy HEAD**. cPanel runs `.cpanel.yml`: `npm ci`, `npm run build`, then copies the contents of `dist/` into the document root.

`public/.htaccess` is copied into `dist/` by the build. It turns directory listings off, serves `index.html`, and sends unknown URLs to `404.html`. `www.miraforge.com` should keep redirecting to `https://miraforge.com` in the host's domain settings. Do not add a second redirect in `.htaccess` unless the host is not already forcing HTTPS.

`dist/` stays out of Git. The server builds it. Do not upload `node_modules` or a nested `dist` folder.

If the host cannot run Node.js 24, build on your machine with `npm run build` and upload the **contents** of `dist/` to the document root instead of using the `.cpanel.yml` build tasks.

The handbook link on this site goes to [/docs/](https://miraforge.com/docs/) until the full documentation site is ready.
