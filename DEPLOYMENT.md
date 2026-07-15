# FestFrame Deployment

FestFrame is a client-only Vite application. It requires no database or server functions for the current MVP.

## Prerequisites

- Node.js 22.12 or newer
- npm
- A Vercel account
- A real Ko-fi, Buy Me a Coffee, Lemon Squeezy, or payment-link URL if support should be visible

## Verify Locally

```bash
npm ci
npm run verify
```

`npm run verify` runs lint, the production build, and the browser smoke tests. The smoke test starts its own local server when port 5173 is not already serving FestFrame.

## Fastest Option: Vercel Drop

1. Open [vercel.com/drop](https://vercel.com/drop).
2. Drop this project folder into the page.
3. Choose your account and use the project name `festframe`.
4. Let Vercel detect Vite and build the project.
5. Add `VITE_SUPPORT_URL` in the new project's Environment Variables and redeploy if support should be visible.

Use this for the fastest first URL. Connect GitHub afterwards if the product continues, so timetable and code updates deploy automatically.

## Option A: Deploy This Folder With Vercel CLI

The Vercel CLI is not currently installed globally. Use `npx`:

```bash
npx vercel@latest
```

When prompted:

- Scope: your Vercel account
- Link to existing project: No
- Project name: `festframe`
- Directory: `.`
- Override settings: No

Add the production support URL:

```bash
npx vercel@latest env add VITE_SUPPORT_URL production
```

Then publish production:

```bash
npx vercel@latest --prod
```

## Option B: GitHub And Automatic Deployments

This directory is not currently a Git repository. Create one and push it to a new GitHub repository:

```bash
git init
git add .
git commit -m "Launch FestFrame MVP"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

In Vercel:

1. Select **Add New > Project**.
2. Import the GitHub repository.
3. Confirm Framework Preset `Vite`.
4. Confirm Build Command `npm run build`.
5. Confirm Output Directory `dist`.
6. Add `VITE_SUPPORT_URL` under Environment Variables.
7. Deploy.

The checked-in `vercel.json` already supplies the Vite build settings, security headers, short timetable caching, and wallpaper caching.

## Domain And Social Preview

After the first deployment:

1. Add the preferred domain in **Project Settings > Domains**.
2. Open the deployed URL and confirm the title is `FestFrame · Tomorrowland 2026 Planner`.
3. Test the social preview on the actual HTTPS URL.
4. Replace relative `og:image` and `twitter:image` values with absolute domain URLs if a target platform does not resolve them.

## Production Checklist

### Blocking Before Public Traffic

- [ ] Put the real payment URL in `VITE_SUPPORT_URL`, or intentionally launch without the support button.
- [ ] Test PNG download on a real iPhone Safari and Android Chrome device.
- [ ] Import the ICS file into Apple Calendar and Google Calendar on real devices.
- [ ] Recheck the W1 and W2 timetable snapshots against official updates.
- [ ] Decide whether to remove the local-only email gate; it adds friction but does not currently capture a lead.
- [ ] Add privacy-friendly event analytics for first selection, five selections, wallpaper export, and share.
- [ ] Confirm the unofficial-product disclaimer is visible enough on the first session and exports.

### High-Value Next Improvements

- [ ] Add Web Share API support after wallpaper export, with download fallback.
- [ ] Add a shareable route URL or compact route code for friends.
- [ ] Add a visible "timetable updated" timestamp sourced from the data files.
- [ ] Add an error boundary and a user-facing retry state around timetable loading.
- [ ] Add a minimal privacy page before collecting analytics or real emails.
- [ ] Verify a FestFrame domain and trademark before investing in broader branding.

### Later, After Demand

- [ ] Real authentication and cross-device storage.
- [ ] Friend alignment and Crew Pack.
- [ ] Automated timetable ingestion for other festivals.
- [ ] Paid premium wallpaper/device packs.
- [ ] Monitoring, error reporting, and an uptime check.

## Updating Timetables

Replace the appropriate file in `public/data/`, run verification, and redeploy:

```bash
npm run verify
npx vercel@latest --prod
```

The timetable cache is configured for five minutes at the Vercel edge, so corrections propagate quickly without disabling caching entirely.
