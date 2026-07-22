# FestFrame W2 growth plan

Last updated: 22 July 2026

## What W1 proved

The useful product is not another festival timetable. It is a fast way to turn a messy timetable into something visible on a lock screen.

Observed between 15 and 22 July:

- 142 visitors in Vercel Web Analytics.
- The first Reddit post received about 4,000 views, 8 upvotes, and 5 comments.
- 77 browser sessions exported a wallpaper; those sessions created 156 exports in total.
- Six browser sessions used native sharing.
- 24 likely-real saved email profiles were created after excluding obvious test records.
- 16 likely-real profiles had a non-empty plan; 15 profiles selected W2.
- Ten W2 profiles saved at least five sets. Median plan depth across saved W2 profiles was 21 sets.
- Several profiles returned on a later day and updated their plan. This is the strongest sign that FestFrame became a working planning tool rather than a one-time demo.

These metrics use two different systems. Vercel reports visitors; the product database historically generated a new session ID on page reload. Do not describe 77 export sessions as 77 unique users. Persistent visitor IDs and complete activation/export events are enabled for W2.

## The traffic reality

The Reddit post's maximum possible visit rate was 142 / 4,000 = 3.55%, assuming every visitor came from Reddit. At that rate, 2,000 visits require at least 56,000 post views. One more organic post or a $25 ad cannot reliably create that result.

The W2 target therefore needs several borrowed audiences:

| Channel | Execution target | Visit target |
| --- | ---: | ---: |
| Festival creators and fan pages | 5 placements from 20 direct pitches | 800-1,000 |
| WhatsApp, Telegram, Facebook, and travel groups | 10 admin-approved placements | 400-600 |
| Instagram/TikTok/Reels from owned accounts | 2 native demo videos + Stories | 250-400 |
| Reddit | 1 mod-approved founder post + useful comments | 150-300 |
| Reddit Ads test | $25, one mobile creative | 25-100 |
| Direct sharing from current users | Share prompt after export | 100-250 |

This is a stretch plan, not a forecast. The controllable goal is 20 pitches and 10 approved group placements today; traffic is the result.

## Positioning

**Promise:** Put your W2 route on your lock screen before you enter.

**Proof:** Built and tested during W1. People returned to update real W2 plans and exported 156 wallpapers across 77 browser sessions.

**Difference:** The official app is the source of truth. FestFrame is the quick planning and export layer: Must / Want / Maybe, conflict visibility, wallpaper, calendar.

**Disclosure:** Free, unofficial, email optional. Check official timetable updates before attending.

## 72-hour launch

### Wednesday, 22 July

1. Deploy W2 as the default and refresh the timetable from the official source.
2. Send the creator and group-admin pitches below. Prioritize Belgium, Netherlands, Germany, UK, Ukraine, and Tomorrowland travel groups.
3. Send modmail before posting in r/Tomorrowland because its published rules prohibit advertising and self-promotion.
4. Publish the 9:16 lock-screen demo to Instagram and TikTok. Show the finished wallpaper in the first second.
5. Start the $25 Reddit Ads test only after the tagged landing URL is verified.

### Thursday, 23 July

1. Repost the demo to Stories with `W2 tomorrow` urgency.
2. Follow up once with creators/admins who opened or answered.
3. Publish only in groups where an admin approved it.
4. Review source-level visits and exports at 18:00. Keep the top creative; stop weak paid creative.

### Friday, 24 July

1. Publish a short `do this before entering` reminder between 08:00 and 10:00 CEST.
2. Ask users who exported to send FestFrame to their festival group.
3. Stop broad promotion after early afternoon; festival utility and support matter more once gates are busy.

## Measurement

Primary funnel for W2:

1. `planner_opened`
2. `first_artist_selected`
3. `five_artists_selected`
4. `wallpaper_exported` or `calendar_exported`
5. `wallpaper_shared`
6. `plan_restored`

Targets after the tracking update:

- 2,000 persistent visitors.
- At least 50% select one artist.
- At least 25% select five artists.
- At least 15% complete any export.
- At least 10% export a wallpaper.
- At least 3% of activated visitors use native sharing.

Run the aggregate report without exposing email addresses:

```bash
npm run analytics:report -- 2026-07-22
```

Use a unique `utm_content` for every placement:

```text
https://festframe.vercel.app/?utm_source=reddit&utm_medium=organic_social&utm_campaign=w2_launch&utm_content=founder_post
https://festframe.vercel.app/?utm_source=reddit&utm_medium=paid_social&utm_campaign=w2_launch&utm_content=lockscreen_demo
https://festframe.vercel.app/?utm_source=instagram&utm_medium=creator&utm_campaign=w2_launch&utm_content=creator_name
https://festframe.vercel.app/?utm_source=telegram&utm_medium=community&utm_campaign=w2_launch&utm_content=group_name
```

## Copy bank

### Modmail to r/Tomorrowland

Hi mods - I built a free, unofficial W2 planner after using it during W1. It lets people mark Must / Want / Maybe, then export the route as a lock-screen wallpaper or calendar. The first post reached about 4k views, and the useful W1 lesson was simply not having to reopen a timetable all day.

Would you allow one transparent W2 follow-up focused on that practical lesson? No selling, no app install, and email is optional. I am happy to use a weekly thread or remove the direct link if that fits the rules better.

### Transparent Reddit post

**Title:** W1 lesson: put your W2 schedule on your lock screen before you enter

Disclosure: I built FestFrame because I wanted my route visible without reopening an app all day.

During W1, people made 156 wallpaper exports across 77 browser sessions, and some came back later to update their W2 plans. That made the useful part pretty clear: pick Must / Want / Maybe, see the clashes, then keep the result on the lock screen.

W2 is now the default and the timetable was refreshed today. It is free and unofficial; email is optional. The official app is still the source of truth for last-minute changes.

Plan W2: [tagged link]

### Honest advice-style version

**Title:** One small thing that made W1 easier

Keep your route somewhere you can see without unlocking and searching through the timetable every time.

I built a small tool for this during W1: mark the sets you care about, see overlaps, then export the result as a lock-screen wallpaper or calendar. I refreshed it for W2 today. Free, unofficial, and email is optional.

[tagged link]

Do not rewrite this as `I recently found this planner`. That is a fake recommendation. It creates moderator and trust risk exactly where transparent founder disclosure is acceptable.

### Reddit ad

**Headline:** W2 starts Friday. Put your Tomorrowland route on your lock screen.

**Body:** Mark Must / Want / Maybe, spot clashes, and export a wallpaper or calendar. Free, unofficial, no app install.

**CTA:** Plan W2

Use the real botanical lock-screen result as the image. Do not show the signup screen. Target mobile users and treat $25 as a creative test, not a scale channel.

### Creator or fan-page DM

Hey - I built a free Tomorrowland planner after testing it during W1. The useful bit is the output: your full route becomes a lock-screen wallpaper, so you do not keep reopening the timetable.

W2 is ready now. I am not looking for a scripted endorsement; I can send you a 10-second demo and a tagged link if it feels useful for your audience.

### Group post

Small W1 lesson: reopening the timetable all day gets old quickly.

I made a free W2 planner where you mark Must / Want / Maybe and export the final route as a phone wallpaper or calendar. W2 is updated and opens by default now. Unofficial, email optional:

[tagged link]

### Reel / TikTok

On-screen sequence:

1. `Going to Tomorrowland W2?`
2. Show three priority taps.
3. Show one conflict.
4. Reveal the finished lock-screen wallpaper.
5. `Your whole route. One glance.`
6. `Free at FestFrame`

Caption:

Your W2 route should not be buried inside another app. Pick the sets, spot the clashes, put the plan on your lock screen. Free, unofficial, email optional. #Tomorrowland2026 #TomorrowlandW2

## Channel rules

- Do not use fake discovery language or undisclosed recommendations.
- Ask community admins/moderators before direct promotion.
- Give every creator or group a distinct tagged link.
- Lead with the finished lock-screen artifact, not the planner interface.
- Do not publish individual emails, plans, or small-sample artist rankings.
- Use the official timetable as source of truth and refresh again on 23 and 24 July.

References: [r/Tomorrowland rules](https://www.reddit.com/r/Tomorrowland/comments/1r1gqxy/official_subreddit_rules_guidelines/), [Reddit spam policy](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam), [Reddit Ads audience targeting](https://business.reddithelp.com/articles/Knowledge/Audience-Manager).
