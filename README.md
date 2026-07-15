# FestFrame

A Vite-powered personal festival planner for Tomorrowland Belgium 2026. It is intentionally client-first so it can deploy to Vercel's free static hosting tier without a database.

- [Marketing strategy](./MARKETING_STRATEGY.md)
- [Deployment guide and launch checklist](./DEPLOYMENT.md)

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Import this repository in Vercel. Vercel detects Vite automatically; use `npm run build` and publish `dist`.

To show the optional supporter link in the header and export menu, configure the deployment environment variable:

```bash
VITE_SUPPORT_URL=https://ko-fi.com/your-page
```

Every feature remains free. The support links stay hidden when this variable is not configured.

## Wallpaper themes

The export menu includes the `Consciousness` and `Botanical` lock-screen backgrounds. Both use the live selected-set timeline rather than a pre-rendered schedule. Reference exports are in `public/wallpapers/samples/`.

## Data

`public/data/` contains static snapshots of the official 2026 W1/W2 timetable captured on 15 July 2026, including published artist-image URLs. The planner does not scrape the timetable at runtime. Update those files manually when official set times change, and always verify the official timetable before attending.

## Privacy and login

The login is a local profile gate designed for a private, no-backend Vercel deployment. The email and all selections are stored only in the browser's local storage. Add a real auth provider and database before using this for shared or cross-device plans.
