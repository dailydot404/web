# Admin web

Directors open **https://dailydotkids.ca/admin/** on a computer or TV, then approve from the Admin app with QR or pairing code. The page is public; daycare data is not. A session ends when the tab closes, Close Session is tapped, or it is idle for 5 minutes.

`admin-portal/` is a retired Vite prototype. It is gitignored and must not be published.

The live page is the Expo export in `admin/`, built from `DailyDot_admin`.

## Local development

1. Backend (`local` profile):
   ```bash
   cd dailydot_backend
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```

2. Admin web:
   ```bash
   cd DailyDot_admin
   npm run web:local
   ```
   Usually `http://localhost:8081`. API is `http://localhost:8080`.

3. Admin phone:
   ```bash
   cd DailyDot_admin && npm run ios:local
   ```
   Log in, then **Settings → Connect web browser**.

## Production publish

From `DailyDot_admin`:

```bash
npm run export:web:prod
```

That writes `../web/admin/`. Commit and push the `web` repo so GitHub Pages updates `https://dailydotkids.ca/admin/`.

Marketing screenshots for the homepage live in `screenshots/admin/` (not under `admin/`, which is reserved for the web app export).

The published bundle talks to **prod** API. For demo, run `APP_ENV=demo npm run web` locally instead of using the public page.
