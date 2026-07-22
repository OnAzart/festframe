# FestFrame

A Vite-powered personal festival planner for Tomorrowland Belgium 2026. Email is optional; email profiles restore festival plans across devices through Neon Postgres, while skipped profiles remain on-device.

- [Marketing strategy](./MARKETING_STRATEGY.md)
- [72-hour launch playbook](./LAUNCH_PLAYBOOK.md)
- [SEO checklist](./SEO_CHECKLIST.md)
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

`public/data/` contains static snapshots of the official 2026 timetable, including published artist-image URLs. W2 was refreshed from the official Tomorrowland CDN on 22 July 2026. The planner does not scrape the timetable at runtime. Update those files manually when official set times change, and always verify the official timetable before attending.

## Privacy and login

People can enter an email or skip directly to the planner. Email profiles sync the selected route through an email plus hashed lookup key; skipped profiles remain local to that device. This temporary restore does not verify email ownership yet. Vercel supplies a two-letter country code to the API; FestFrame does not persist raw IP addresses or send marketing email without separate consent.

Meta Pixel is not active. See [the marketing strategy](./MARKETING_STRATEGY.md#13-meta-pixel-implementation-gate) before adding advertising tracking.

Public [Privacy](https://festframe.vercel.app/privacy.html) and [Terms](https://festframe.vercel.app/terms.html) pages describe the current data flow. They identify the project as OnAzart; add a dedicated private contact email and verified sign-in before treating the current setup as a mature account system.

## Growth instrumentation

FestFrame records a small first-party activation funnel in Neon and uses Vercel Web Analytics for aggregate traffic. `planner_opened` stores safe UTM values and the referring hostname; it does not receive email or artist names. Wallpaper downloads and native mobile shares are separate events, so the branded export loop can be measured directly.

Generate an aggregate report without printing email addresses:

```bash
npm run analytics:report -- 2026-07-15
```

The report prints aggregate acquisition, activation, export, retention, and plan-quality metrics without printing email addresses. The current low-effort launch plan, channel copy, video workflow, compliance notes, and monetization options live in [`marketing/README.md`](./marketing/README.md).

From the W2 instrumentation release onward, product events include a persistent anonymous browser ID, correct selection milestones, plan restores, and separate calendar/PDF exports. Historical rows keep their session-level identifiers.
