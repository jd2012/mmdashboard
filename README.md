# Mountain Operations Dashboard

A responsive GitHub Pages starter based on the supplied dashboard sketch.

## Pages

- `index.html` — dashboard with Safety, General Info, Inspirational Quote, CV Daily Ops, MV Daily Ops, and 12-Hour Outlook boxes.
- `admin.html` — separate local admin setup/sign-in page and editor for box headings and content.

## Prototype behavior

The editor stores data in the current browser's `localStorage`. On the first visit to Admin in a browser, create a local username and password. The session ends when the browser session ends. Content and credentials do not synchronize between devices or browsers.

This is a UI prototype, not a secure multi-user admin system. GitHub Pages cannot run server-side authentication or save shared data. The local password check can be bypassed by a visitor who can inspect the static site, so do not use real credentials or sensitive operational information here.

## Before team use

To support multiple admins and shared updates, connect these pages to a backend with server-side authentication and a shared database. The existing form/UI can be retained while replacing its local storage calls with authenticated API requests.

## Publish with GitHub Pages

The repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`. In repository **Settings → Pages**, set the source to **GitHub Actions** if it is not already selected. Pushes to `main` then publish the site automatically. The site is available at `https://jd2012.github.io/mmdashboard/`; the admin editor is at `/admin.html`.
