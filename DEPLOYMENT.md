# FestFrame Deployment

FestFrame is a Vite app deployed to Vercel with serverless API routes, Neon analytics storage, and a separate Neon database for optional email profiles, country codes, and festival-plan sync.

## Current Production Setup

- Vercel project: `onazart-team/festframe`
- Production URL: `https://festframe.vercel.app`
- GitHub: `OnAzart/festframe`
- Analytics database: `festframe-db`
- Profiles database: `neon-bisque-zebra`, connected with the `AUTHDB_` prefix
- Support: `https://ko-fi.com/onazart`

Vercel already supplies `DATABASE_URL` and `AUTHDB_DATABASE_URL` in Production, Preview, and Development. The older Neon Auth variables are reserved for a future verified-sync feature and are not used by the current frontend.

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

`db/schema.sql` owns anonymous product events and country code. `db/auth-schema.sql` owns optional email leads and festival plans stored with both email and a hashed lookup key. Email profiles sync through `/api/plans`; skipped profiles stay in local storage. The older Auth tables remain reserved for future verified sync.

## Deploy

GitHub pushes to `main` deploy automatically. For a direct production deployment:

```bash
npx vercel --prod
```

## Optional Environment Variables

- `VITE_SUPPORT_URL`: overrides the default Ko-fi URL.
- `VITE_META_PIXEL_ID`: reserved for Meta Pixel; do not add it until consent UI and the Privacy Policy are live.

## Public Launch Checklist

- [x] Optional email capture with a no-email skip path.
- [x] Automatic cross-device plan restore for email profiles.
- [x] Local festival-plan storage for skipped profiles.
- [x] Country code collection without storing raw IP.
- [x] Ko-fi support destination.
- [x] Calendar, PDF, and iPhone 17/17 Pro wallpaper exports.
- [x] Native mobile wallpaper sharing with a download fallback.
- [x] Automated desktop/mobile and wallpaper safe-area tests.
- [x] Publish Privacy and Terms pages with the current project identity and data flow.
- [x] Publish canonical metadata, sitemap, robots rules, and WebApplication schema.
- [ ] Add the operator's legal name or trading identity and a private contact email to the Privacy Policy.
- [ ] Add a documented email-data deletion request channel.
- [ ] Replace temporary email lookup with verified OTP or magic-link sign-in.
- [ ] Test PNG and ICS output on real iPhone and Android devices.
- [ ] Recheck W1/W2 timetable snapshots against official updates.
- [ ] Add consent UI before loading Meta Pixel or other advertising cookies.
- [ ] Verify `https://festframe.vercel.app` in Google Search Console and submit `/sitemap.xml`.

## Updating Timetables

Replace the appropriate file in `public/data/`, run `npm run verify`, and push to `main`. Timetable data is cached for five minutes at the Vercel edge.
