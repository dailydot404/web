# UI testing matrix — DailyDotKids

Broken paths and blank screens should fail in CI or a local smoke before humans click around.

## Coverage program (unit → integration → smoke → UI)

**Goal:** near-100% on *critical product paths*, then raise overall measurable coverage. Literal 100% of every line across backend + three apps + web is not the bar — untested vault/billing edge branches and excluded giant screens would burn months for little user value.

### Measured baselines (2026-10-07, post 90% unit gate + UI path wave)

| Surface | Metric | Gate now | Notes |
|---------|--------|----------|-------|
| Backend (JaCoCo, scoped) | Lines / branches | **90% / 70%** | Controllers/adapters/Vault/Billing excluded from gate; dedicated unit tests remain |
| Admin / Parent / Teacher Jest | Lines / stmts / funcs / branches | **90% / 90% / 90% / 70%** | Giant screens out of `collectCoverageFrom` → covered by Maestro/Playwright |
| Superadmin Vitest | Same | **90% / 70%** | Large daycare panels → Playwright e2e |
| UI path / CRUD | Destinations | Smoke + matrices + Help→tour + **Jest-exclude path flows** | Red = NO-GO |
| Journey | Admin student → Parent sees kid | `scripts/run-journey-student-parent.sh` | Suite `journey` in `run-ui-tests.sh` |

### Unit-exclude → UI path coverage (2026-10-07)

Screens/services dropped from Jest/Vitest must still have a **path visit** (or CRUD) or an explicit defer note.

| App | Jest-excluded product surface | UI coverage |
|-----|------------------------------|-------------|
| Admin | Billing / Vault / Safety / Policy / Licensing / Waitlist / Team / Plan / Categories / Daycare / Invitations | Maestro `more-all` + `more-deep` + `waitlist-sheet-shell` + `plan-team-shell` + `team-member-deep` + `vault-billing` + `compliance-deep` + `invitations-categories-deep` + `tabs-fab-shell` + `help-profile-deep`; Playwright `path-deep` + `more-destinations` + `plan-team` (incl. TeamMember) + `compliance-destinations` |
| Admin | NotificationInbox / Settings / Contact us / Setup guide | Maestro `notification-inbox` (seeded list + mark-all-read + retention); Playwright `notification-inbox` (API + UI) + `help-profile` + `path-deep` |
| Admin | AnnouncementDetails / StudentDetails / TeacherDetails / ClassDetails / Class Record | Maestro `bulletin-details`, `roster-details-deep`, `locations-drilldown`, `class-record-deep`, `tabs-fab-shell`; Playwright `roster-drilldown` + `class-record-deep` + `path-deep` |
| Admin | Login / FreeSignup / ForgotPassword | Maestro `admin-login` (+ forgot shell), `admin-signup-*` |
| Parent | Settings / Inbox / Billing / EditInfo / Bulletin / Contact / Kids path | Maestro `profile`, `profile-sections-deep`, `settings-path-deep` (each self-opens Profile), `notification-inbox`, `billing-vault`, `edit-info-shell`, `bulletin-deep`, `kids-path-deep`, `contact-us-shell` |
| Teacher | Settings / Inbox / Vault / Policy / Pin / Clock+Diary / StudentDetails / Record / Activity log | Maestro `profile`, `settings-path-deep`, `contact-us-shell`, `activity-actions-shell`, `notification-inbox`, `vault-policy-profile`, `pin-identify`, `clock-diary-shell`, `students-path-deep`, `student-details-tabs`, `record-history-shell` |
| Superadmin | Every sidebar route + daycare tabs + Usage/Deletions/Contact filters | Playwright `path-deep`, `dashboard-deep`, `daycare-workspace`, `ops-pages`, `routes`, `pages` |

Infra-only excludes (no UI path required): `apiService`, `authSession`, `firebaseService`, `fcmDeviceToken`, navigators, `App.tsx`, keyboard wrappers.

### Pyramid (do not collapse into one mega-test)

1. **Unit** — services, login/DTO shapes, `AppUpdatePrompt`, auth session soft-error rules.
2. **Integration / API** — WebMvc + `mvn test` + orchestrator API signup; assert DB/API after mutations.
3. **Smoke / path UI** — Maestro `*-smoke` / `*-all-flows` + Admin Playwright pairing + **deep atlases** (`path-deep` Admin web + Superadmin).
4. **CRUD UI** — per-app `*-crud.yaml` + admin web crud matrix.
5. **Journeys** (thin) — orchestrated Admin→Parent (create student → invite → parent sees kid); not every unit case.

### Critical-path “~100%” set (must stay green)

- Login / refresh / session epoch / forced-logout rules  
- Admin web pairing  
- Student / teacher / parent roster + invite signup  
- Soft vs force app update (`/api/public/app-version` + client prompt)  
- uiPreferences on login + GET/PUT  
- Main tabs + More destinations (incl. Profile)

### Commands

```bash
# Backend coverage report + gate
cd dailydot_backend && mvn -q verify   # report: target/site/jacoco/

# Client coverage
cd DailyDot_admin && npm test -- --coverage --watchAll=false
cd DailyDot_parent && npm test -- --coverage --watchAll=false
cd DailyDot_teacher && npm test -- --coverage --watchAll=false

# UI path + CRUD (local backend)
ACCOUNT_MODE=existing ./scripts/run-ui-tests.sh
./scripts/maestro-sequential.sh
```

## One command (recommended)

From `dailydot_backend` — **startup reliability gate** (customer paths; run before ship):

```bash
# Health + compat + auth unit + API paths + student→parent journey + Maestro smoke
./scripts/run-reliability-gate.sh

# API-only (no device)
SKIP_MAESTRO=1 ./scripts/run-reliability-gate.sh
```

Full orchestrator (starts local backend if needed):

```bash
# Existing demo accounts + new invite/Free signup (API). Skip Maestro unless installed.
SKIP_MAESTRO=1 ./scripts/run-ui-tests.sh

# Existing accounts only (demo logins + full mobile path suites)
ACCOUNT_MODE=existing ./scripts/run-ui-tests.sh

# New accounts only (seed invites → API signup + Maestro signup UIs)
ACCOUNT_MODE=new ./scripts/run-ui-tests.sh

# Pick suites
SUITES=api,web,invoice ACCOUNT_MODE=all SKIP_MAESTRO=1 ./scripts/run-ui-tests.sh

# Cross-app journey only (Admin create student → Parent invite/signup → Parent sees kid)
SUITES=journey SKIP_MAESTRO=1 ./scripts/run-ui-tests.sh
# or: ./scripts/run-journey-student-parent.sh
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
| `new` | Fresh invites + invite signup + freemium lifecycle (API and/or Maestro `admin-freemium-lifecycle.yaml`) |
| `all` | Both |

## Per-surface commands

| Surface | Tool | Command | CI |
|---------|------|---------|----|
| **Orchestrator** | bash | `dailydot_backend/scripts/run-ui-tests.sh` | Local |
| **Marketing site** (`web`) | Static link scan + Playwright crawl | `python3 scripts/check-links.py` · `npm run test:e2e` | `.github/workflows/ui-smoke.yml` |
| **Admin web** | Playwright pairing → tabs + More destinations + CRUD | `npm run test:e2e:web` / `npm run test:e2e:web:crud` | Local (needs demo backend) |
| **Admin mobile** | Maestro | `npm run smoke:local` / `npm run smoke:local:crud` / signup: `admin-signup-invite.yaml`, `admin-signup-free.yaml`, `admin-freemium-lifecycle.yaml` | Simulator |
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

`scripts/seed-e2e-invites.sh` creates unused invite codes + Free-signup emails under `scripts/.e2e/ui-new-accounts.env` (SuperAdmin key default: `local-super-admin-key`). The orchestrator consumes them for API and Maestro signup flows.

Freemium UI: `admin-freemium-lifecycle.yaml` (signup → create location/student/bulletin → search hit/miss). Leftover daycares (`Free Centre*` / `*@test.dailydot.local`) are removed by `cleanup-e2e-artifacts.sh` on pre-start and EXIT.

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
| **Admin mobile** | `DailyDot_admin` `npm run smoke:local:crud` | Location, class, student, teacher, bulletin (+ image), waitlist, policy text/PDF seed/upload, teacher vault CRC |
| **Admin web** | `DailyDot_admin` `npm run test:e2e:web:crud` | FAB gate + API CUD for student, teacher, bulletin, waitlist, location, class |
| **Teacher** | `DailyDot_teacher` `npm run smoke:local:crud` | Diary note, clock in/out, time logs shell |
| **Parent** | `DailyDot_parent` `npm run smoke:local:crud` | Allergies, other info, emergency contact |

### Media fixtures + cleanup

Canonical files: `dailydot_backend/scripts/e2e-fixtures/e2e-sample.{png,jpg,pdf}` (synced into each app’s `e2e/fixtures/`).

| Script | Role |
|--------|------|
| `prepare-e2e-fixtures.sh` | Sync fixtures + seed iOS Photos / Android Download |
| `seed-e2e-files.sh` | API-upload E2E policy PDF + bulletin image + vault enable/PIN/`E2E Fixture Vault CRC` |
| `seed-e2e-search-data.sh` | Seed `E2E Search*` student/bulletin for filter asserts |
| `seed-e2e-notifications.sh` | Wipe that user’s `E2E%` inbox rows, then seed `E2E Notif *` (Unread A/B + Aged) for Admin/Parent/Teacher |
| `cleanup-e2e-artifacts.sh` | Pre-start + EXIT: `E2E*` rows, `e2e-*` uploads, freemium daycares, `E2E Notif*` inbox |

Search/filter hit-miss: Admin `flows/tab-search-filters.yaml`, Teacher `flows/students-search.yaml` (demo names + optional `E2E Search*`, miss `ZZZNoMatchE2E`).

**Vault / policy files:** Maestro `flows/crud-vault.yaml` (API seed + unlock + UI delete) + `flows/crud-policy-pdf-upload.yaml` (`__DEV__` E2E-title auto-attach); Playwright `crud-matrix` policy multipart (API + filechooser) + vault teacher multipart (API create, UI unlock/verify).

**Notification persistence:** Maestro Admin/Parent/Teacher `flows/notification-inbox.yaml` assert seeded titles + mark-all-read + retention chips; Playwright `npm run test:e2e:web:notifications` covers API list/mark-all/retention purge + Profile UI.

## Adding coverage

- New marketing page → `web/e2e/links.spec.ts` `SEED_PATHS`.
- New admin More option → `DailyDot_admin/e2e/flows/more-all.yaml`.
- New parent/teacher surface → `*-all-flows.yaml`.
- New mutable record type → new `flows/crud-*.yaml` (or Playwright test), wire into `*-crud.yaml`, update that app’s `e2e/CRUD-MATRIX.md` + this table.
- New signup field → matching `*-signup*.yaml` + testIDs.
- New superadmin sidebar item → `Layout.tsx` + `e2e/routes.spec.ts`.
- New invoice route → `invoice_flattener/e2e/smoke.spec.ts`.
