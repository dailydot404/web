import { expect, test, type Page } from '@playwright/test';

/** Key entry pages — expand when new public surfaces ship.
 *  Skip flyer.html — gitignored (local print only).
 */
const SEED_PATHS = [
  '/',
  '/about.html',
  '/404.html',
  '/meetings/top-tier-nicole-leavebehind.html',
  '/meetings/top-tier-nicole.html',
];

const SKIP_HREF =
  /^(#|mailto:|tel:|javascript:|data:|https?:)/i;

async function collectSameOriginHrefs(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out = new Set<string>();
    for (const el of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      const href = el.getAttribute('href')?.trim() || '';
      if (!href) continue;
      out.add(href);
    }
    return [...out];
  });
}

function toPath(href: string, base: string): string | null {
  if (SKIP_HREF.test(href)) return null;
  try {
    const url = new URL(href, base);
    if (url.origin !== new URL(base).origin) return null;
    // Drop query/hash for static file check; keep pathname
    return url.pathname || '/';
  } catch {
    return null;
  }
}

test.describe('Marketing site link smoke', () => {
  test('seed pages load and same-origin hrefs are not 404', async ({ page, request, baseURL }) => {
    expect(baseURL).toBeTruthy();
    const broken: string[] = [];
    const checked = new Set<string>();

    for (const seed of SEED_PATHS) {
      const res = await page.goto(seed, { waitUntil: 'domcontentloaded' });
      const status = res?.status() ?? 0;
      if (status >= 400) {
        broken.push(`${seed} (seed page status ${status})`);
        continue;
      }

      const pageUrl = page.url();
      const hrefs = await collectSameOriginHrefs(page);
      for (const href of hrefs) {
        // Resolve relative to the current page (not the site root).
        const path = toPath(href, pageUrl);
        if (!path) continue;
        // Vite SPA source — not a published route
        if (path.includes('/src/') && path.endsWith('.tsx')) continue;
        if (checked.has(path)) continue;
        checked.add(path);

        const probe = await request.get(path);
        if (probe.status() >= 400) {
          broken.push(`${seed} → ${href} (GET ${path} → ${probe.status()})`);
        }
      }
    }

    expect(broken, broken.join('\n')).toEqual([]);
  });
});
