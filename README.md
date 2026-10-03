# VPN Account Portal UI

A responsive collection of account and payment-flow interfaces for a VPN service.

**Stack:** HTML · Tailwind CSS 4 · JavaScript · Playwright

## Features

- Sign-in and account-number registration interfaces.
- Add-time screens for multiple payment methods.
- Devices, downloads, receipts, account recovery and WireGuard configuration layouts.
- Shared navigation, loading states and form validation.
- Scripts to synchronize shared layout and check rendering at desktop and mobile widths.

## View the interface

Open `index.html` in a browser. Compiled CSS is included at `src/css/output.css`.

To rebuild or watch styles:

```bash
npm ci
npm run build
npm run dev
```

Here, `npm run dev` watches Tailwind styles; it does not start a web server.

## Rendering checks

```bash
npx playwright install chromium
npm run verify:render
```

The verification script opens local pages and checks layout overflow, image loading, page errors and selected interactions across several viewport sizes.

## Structure

- Root HTML files — sign-in and registration.
- `add-time/` — payment-method interfaces.
- Other page directories — account features.
- `src/js/` — interface behavior.
- `src/css/input.css` — Tailwind source.
- `scripts/` — shared-layout maintenance and rendering checks.

## Scope

This is a frontend prototype. Account numbers, QR images and payment screens are demonstration content. Authentication, payments and VPN provisioning require real backend services.
