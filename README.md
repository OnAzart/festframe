# FestFrame

A Vite-powered personal festival planner for Tomorrowland Belgium 2026. Email is optional; email profiles restore festival plans across devices through Neon Postgres, while skipped profiles remain on-device.

- [Marketing strategy](./MARKETING_STRATEGY.md)
- [Deployment guide and launch checklist](./DEPLOYMENT.md)

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Import this repository in Vercel. Vercel detects Vite automatically; use `npm run build` and publish `dist`.

The header and export menu link to Ko-fi by default. Override the destination with:

```bash
VITE_SUPPORT_URL=https://ko-fi.com/onazart
```

Every feature remains free; support is optional.

## Wallpaper themes

The export menu includes the `Consciousness` and `Botanical` lock-screen backgrounds. Both use the live selected-set timeline rather than a pre-rendered schedule. Reference exports are in `public/wallpapers/samples/`.

## Data

`public/data/` contains static snapshots of the official 2026 W1/W2 timetable captured on 15 July 2026, including published artist-image URLs. The planner does not scrape the timetable at runtime. Update those files manually when official set times change, and always verify the official timetable before attending.

## Privacy and login

People can enter an email or skip directly to the planner. Email profiles sync the selected route through a hashed email lookup; skipped profiles remain local to that device. This temporary restore does not verify email ownership yet. Vercel supplies a two-letter country code to the API; FestFrame does not persist raw IP addresses or send marketing email without separate consent.

Meta Pixel is not active. See [the marketing strategy](./MARKETING_STRATEGY.md#13-meta-pixel-implementation-gate) before adding advertising tracking.
