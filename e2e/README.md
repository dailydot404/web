# UI testing — marketing site (dailydotkids.ca)

## Quick

```bash
python3 scripts/check-links.py          # static broken paths (no browser)
npm install && npx playwright install chromium
npm run test:e2e                        # crawl seed pages for 404 links
```

## What it catches

- Missing local `href` / `src` targets in HTML
- Runtime 404s from links on seed pages (home, about, flyer, meetings leavebehinds)

## Cross-app matrix

See [UI testing matrix](./UI-TESTING.md) for Admin / Teacher / Parent / Superadmin / Invoice Manager.
