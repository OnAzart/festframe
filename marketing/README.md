# FestFrame W2 marketing

This is the current execution plan. It is intentionally small because W2 starts on 24 July 2026 and one person must be able to run it without a production team.

## Goal

Generate qualified W2 traffic and learn which message produces completed exports. The stretch target is 2,000 visitors, but the operating target is simpler:

- publish three creative angles using one screen recording;
- secure five creator or fan-page placements from 20 direct messages;
- secure ten admin-approved community placements;
- promote only the creative that produces exports, not the one with the most likes.

## Positioning

**Promise:** Put your W2 route on your lock screen before you enter.

**Proof:** W1 produced 156 wallpaper exports across 77 browser sessions. People returned on later days to update real W2 plans.

**Disclosure:** FestFrame is free and unofficial. The official timetable remains the source of truth.

## Minimum-effort schedule

### 22 July: make and test

1. Spend 15-25 minutes producing one 9:16 master recording using [`VIDEO_CREATION.md`](./VIDEO_CREATION.md).
2. Duplicate it three times and change only the first hook: Problem, Visual, and W1 Proof.
3. Publish the three angles across Instagram, TikTok, Stories, and communities. Do not post three promotional variants in the same subreddit.
4. Send the creator pitch to 20 small Tomorrowland creators or fan pages.
5. At 22:00 CEST, compare visits, five-set plans, and exports by `utm_content`.

### 23 July: distribute the winner

1. Put EUR 25 behind the best creative as a small Reddit Ads test.
2. Send the winning video to every creator or admin who replied.
3. Publish one transparent Reddit post only with moderator approval.
4. Repost the winner to Stories with `W2 tomorrow` urgency.
5. Refresh the official W2 timetable and stop product feature work.

### 24 July: final utility push

1. Publish `W2 starts today` between 08:00 and 10:00 CEST.
2. Ask existing users to send their wallpaper or FestFrame link to their festival group.
3. Stop broad promotion after early afternoon and monitor timetable accuracy/export failures.

## Choose the winner

Likes are a weak signal. Rank creative variants in this order:

1. wallpaper or calendar exports per 1,000 impressions;
2. five-set plans per visitor;
3. first artist selections per visitor;
4. visits per impression;
5. saves, shares, comments, and likes.

Do not call a winner before it has at least 500 organic impressions unless one variant is clearly producing exports and the others are not.

Run the product report:

```bash
npm run analytics:report -- 2026-07-22
```

## UTM convention

Use `w2_launch` everywhere and give every placement a unique `utm_content`.

```text
https://festframe.vercel.app/?utm_source=instagram&utm_medium=organic_social&utm_campaign=w2_launch&utm_content=visual_reel
https://festframe.vercel.app/?utm_source=tiktok&utm_medium=organic_social&utm_campaign=w2_launch&utm_content=problem_video
https://festframe.vercel.app/?utm_source=reddit&utm_medium=paid_social&utm_campaign=w2_launch&utm_content=winner_video
https://festframe.vercel.app/?utm_source=telegram&utm_medium=community&utm_campaign=w2_launch&utm_content=group_name
https://festframe.vercel.app/?utm_source=instagram&utm_medium=creator&utm_campaign=w2_launch&utm_content=creator_name
```

Never place emails, names, or artist selections in UTM values.

## Publish-ready files

- [`posts/instagram-tiktok.md`](./posts/instagram-tiktok.md): three short-form creative variants and captions.
- [`posts/reddit.md`](./posts/reddit.md): modmail, transparent founder post, and comment replies.
- [`posts/communities.md`](./posts/communities.md): Telegram, WhatsApp, Facebook, and Ukrainian copy.
- [`posts/creator-outreach.md`](./posts/creator-outreach.md): creator and fan-page outreach.
- [`VIDEO_CREATION.md`](./VIDEO_CREATION.md): one recording, three videos, no AI or editor required.
- [`MONETIZATION.md`](./MONETIZATION.md): ranked revenue experiments and the recommended first paid offer.
- [`COMPLIANCE.md`](./COMPLIANCE.md): current email readiness and risk checklist.

## Guardrails

- Do not write `recently found this tool`; disclose that you built it.
- Do not repeat self-promotional posts in the same community.
- Lead with the finished lock-screen artifact, not the email screen.
- Do not send marketing email to old leads or unchecked users.
- Do not add Meta Pixel or other advertising tracking before consent handling exists.
- Keep `unofficial` visible and verify the current timetable before every push.
