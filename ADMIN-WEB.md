# Admin web

Directors can open Admin web two ways (both end when the session is closed or idle):

1. **QR / pairing code** — open **https://dailydotkids.ca/admin/** and approve from the Admin app.
2. **Unique link** — in the Admin app tap **Generate unique URL** and open `https://dailydotkids.ca/admin/?s=…`. That token is one session; it stops working when the session ends.

The page itself is public static GitHub Pages. Data still requires a live web session.

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

The published bundle talks to **prod** API. For demo, run `APP_ENV=demo npm run web` locally instead of using the public page.
