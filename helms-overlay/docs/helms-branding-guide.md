# Helms Branding Overlay Guide

Helms branding files live under `helms-overlay/frontend`.

## Files

- `public/helms/logo.svg`: full black Helms logo with a compact mark and large wordmark.
- `public/helms/logo-mark.svg`: compact black connected H mark for icon-only placements on light backgrounds.
- `public/helms/favicon.svg`: blue favicon using the white connected H mark.
- `src/helms/brand.config.ts`: product name, full display name, asset paths, locale, and attribution.

## Rules

- Keep brand assets Helms-owned.
- Do not edit `vendor/clawith` directly.
- Use focused patches only to connect Clawith entry points to these overlay files.
- Keep Clawith and third-party license attribution visible where required.
- Do not change global theme colors when refreshing logo assets unless a separate brand theme task is approved.
