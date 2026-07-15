# FestFrame Deployment

FestFrame is a Vite app deployed to Vercel with serverless API routes, Neon analytics storage, and a separate Neon Auth resource for verified email profiles and cloud-saved plans.

## Current Production Setup

- Vercel project: `onazart-team/festframe`
- Production URL: `https://festframe.vercel.app`
- GitHub: `OnAzart/festframe`
- Analytics database: `festframe-db`
- Auth and plans database: `neon-bisque-zebra`, connected with the `AUTHDB_` prefix
- Support: `https://ko-fi.com/onazart`

Vercel already supplies `DATABASE_URL`, `AUTHDB_DATABASE_URL`, `AUTHDB_NEON_AUTH_BASE_URL`, and `AUTHDB_VITE_NEON_AUTH_URL` in Production, Preview, and Development.

## Verify Locally

```bash
npm ci
npx vercel env pull .env.local
npm run verify
```

The browser smoke test uses its own server on port `4178`; it does not interfere with the normal dev server on `5173`.

## Database Migrations

After pulling environment variables:

```bash
set -a; source .env.local; set +a
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/schema.sql
psql "$AUTHDB_DATABASE_URL" -v ON_ERROR_STOP=1 -f db/auth-schema.sql
```

`db/schema.sql` owns anonymous product events and country code. `db/auth-schema.sql` owns user profiles and saved plans. Neon Auth itself owns verified email identity and sessions.

## Deploy

GitHub pushes to `main` deploy automatically. For a direct production deployment:

```bash
npx vercel --prod
```

## Optional Environment Variables

- `VITE_SUPPORT_URL`: overrides the default Ko-fi URL.
- `VITE_META_PIXEL_ID`: reserved for Meta Pixel; do not add it until consent UI and the Privacy Policy are live.

## Public Launch Checklist

- [x] Verified email sign-in and cross-device cloud plan storage.
- [x] Country code collection without storing raw IP.
- [x] Ko-fi support destination.
- [x] Calendar, PDF, and iPhone 17/17 Pro wallpaper exports.
- [x] Automated desktop/mobile and wallpaper safe-area tests.
- [ ] Publish a Privacy Policy with the operator's legal name or trading identity and contact email.
- [ ] Add account/plan deletion or a documented deletion-request channel.
- [ ] Test the email code on production with a real inbox.
- [ ] Test PNG and ICS output on real iPhone and Android devices.
- [ ] Recheck W1/W2 timetable snapshots against official updates.
- [ ] Add consent UI before loading Meta Pixel or other advertising cookies.

## Updating Timetables

Replace the appropriate file in `public/data/`, run `npm run verify`, and push to `main`. Timetable data is cached for five minutes at the Vercel edge.
