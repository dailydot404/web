# UI testing matrix — DailyDotKids

Broken paths and blank screens should fail in CI or a local smoke before humans click around.

## One command (recommended)

From `dailydot_backend` (starts local backend if needed):

```bash
# Existing demo accounts + new invite/Free signup (API). Skip Maestro unless installed.
SKIP_MAESTRO=1 ./scripts/run-ui-tests.sh

# Existing accounts only (demo logins + full mobile path suites)
ACCOUNT_MODE=existing ./scripts/run-ui-tests.sh

# New accounts only (seed invites → API signup + Maestro signup UIs)
ACCOUNT_MODE=new ./scripts/run-ui-tests.sh

# Pick suites
SUITES=api,web,invoice ACCOUNT_MODE=all SKIP_MAESTRO=1 ./scripts/run-ui-tests.sh
```

## Mobile Maestro — one shared sim (recommended)

Maestro does **not** need a new simulator per app. Prefer one iOS sim + one Android AVD, Admin → Teacher → Parent, uninstall between apps.

```bash
# Smoke on shared iOS + Android (pins device, never calls `maestro start-device`)
./scripts/maestro-sequential.sh

# iOS only / Android only
PLATFORMS=ios ./scripts/maestro-sequential.sh
PLATFORMS=android FLOW=smoke ./scripts/maestro-sequential.sh

# Shared device names (defaults)
#   IOS_SIM_NAME=dailydot-admin-18
#   ANDROID_AVD=Pixel_9_Pro
```

Rules:

1. **Do not** run `maestro start-device` for DailyDot — it creates extra stock sims.
2. Boot **one** iOS 18.3 sim (`dailydot-admin-18`) and shut down `dailydot-teacher-18` / `dailydot-parent-18` during sequential runs.
3. Pin with `maestro test --device <udid|emulator-serial>` or `MAESTRO_DEVICE=… npm run smoke:local`.
4. After each app: uninstall `com.anthor.dailydot.*.local` so the next app starts clean (`UNINSTALL_AFTER=1`).
5. Bundle IDs differ (`.admin.local` / `.teacher.local` / `.parent.local`) so native libs do not conflict on the same device; versions are aligned on RN 0.83.6 / Expo 55.

`ACCOUNT_MODE`:

| Mode | What it verifies |
|------|------------------|
| `existing` | Demo logins (`parent1` / `owner1` / `teacher1`) + full Maestro path suites |
| `new` | Fresh invites + invite signup + Free centre signup (API and/or Maestro) |
| `all` | Both |

## Per-surface commands

| Surface | Tool | Command | CI |
|---------|------|---------|----|
| **Orchestrator** | bash | `dailydot_backend/scripts/run-ui-tests.sh` | Local |
| **Marketing site** (`web`) | Static link scan + Playwright crawl | `python3 scripts/check-links.py` · `npm run test:e2e` | `.github/workflows/ui-smoke.yml` |
| **Admin web** | Playwright pairing → tabs + CRUD (API-driven; FABs read-only) | `npm run test:e2e:web` / `npm run test:e2e:web:crud` | Local (needs demo backend) |
| **Admin mobile** | Maestro | `npm run smoke:local` / `npm run smoke:local:crud` / signup: `admin-signup-invite.yaml`, `admin-signup-free.yaml` | Simulator |
| **Parent** | Maestro | `npm run smoke:local` / `npm run smoke:local:crud` / signup: `parent-signup.yaml` | Simulator |
| **Teacher** | Maestro | `npm run smoke:local` / `npm run smoke:local:crud` / signup: `teacher-signup.yaml` | Simulator |
| **Superadmin** | Playwright | `npm run test:e2e` | `.github/workflows/e2e.yml` |
| **Invoice Manager** | Playwright | `npm run test:e2e` | `.github/workflows/e2e.yml` |

## Demo credentials (existing accounts)

| Role | Email | Password |
|------|-------|----------|
| Parent | `parent1@demo.com` | `password` |
| Admin / owner | `owner1@demo.com` | `password` |
| Teacher | `teacher1@demo.com` | `password` |
| Superadmin | `dailydot404+superadmin+demo@gmail.com` | `dailydot404+demo` |
| Invoice Manager | `admin` | `ChangeMe123!` |

## New accounts

`scripts/seed-e2e-invites.sh` creates unused invite codes + Free-signup emails under `scripts/.e2e/ui-new-accounts.env`. The orchestrator consumes them for API and Maestro signup flows.

## What “broken path” means here

1. **Static site** — `href`/`src` points at a file that does not exist (caught by `check-links.py`).
2. **Web apps** — nav route loads but shell crashes / redirects wrongly (Playwright).
3. **Mobile** — tab or More menu destination is blank or unreachable (Maestro).
4. **Accounts** — existing demo login fails, or new invite/Free signup cannot complete and re-login.
5. **CRUD** — create/edit/delete does not persist or the list/details do not reflect the change (per-entity Maestro flows + admin web Playwright matrix).
6. **App tour** — first login may show the tour; after complete / “Never show me again”, `/ui-preferences` `tourSeen` must prevent auto-show on next login (Help can still start the tour).

## CRUD matrix (comprehensive)

Each app’s `e2e/CRUD-MATRIX.md` is the checklist. Orchestrator runs `*-crud.yaml` after path smoke when Maestro is enabled.

| Surface | Suite | Entities covered |
|---------|-------|------------------|
| **Admin mobile** | `DailyDot_admin` `npm run smoke:local:crud` | Location, class, student, teacher, bulletin, waitlist |
| **Admin web** | `DailyDot_admin` `npm run test:e2e:web:crud` | FAB gate + API CUD for student, teacher, bulletin, waitlist, location, class |
| **Teacher** | `DailyDot_teacher` `npm run smoke:local:crud` | Diary note, clock in/out, time logs shell |
| **Parent** | `DailyDot_parent` `npm run smoke:local:crud` | Allergies, other info, emergency contact |

## Adding coverage

- New marketing page → `web/e2e/links.spec.ts` `SEED_PATHS`.
- New admin More option → `DailyDot_admin/e2e/flows/more-all.yaml`.
- New parent/teacher surface → `*-all-flows.yaml`.
- New mutable record type → new `flows/crud-*.yaml` (or Playwright test), wire into `*-crud.yaml`, update that app’s `e2e/CRUD-MATRIX.md` + this table.
- New signup field → matching `*-signup*.yaml` + testIDs.
- New superadmin sidebar item → `Layout.tsx` + `e2e/routes.spec.ts`.
- New invoice route → `invoice_flattener/e2e/smoke.spec.ts`.
