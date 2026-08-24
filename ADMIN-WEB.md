# Admin web

Directors open **https://dailydotkids.ca/admin/** on a computer or TV. That is a public static page on GitHub Pages. Daycare data is not public: they pair with the Admin phone app (QR or code). Invite-only centres do not need a separate GCP host for this.

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
