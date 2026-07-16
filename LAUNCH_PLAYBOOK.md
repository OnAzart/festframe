# FestFrame 72-Hour Launch Playbook

Updated 16 July 2026 for Tomorrowland Belgium W1.

## Objective

Validate one behavior before expanding the product: people build a meaningful route and export or share the lock-screen wallpaper.

72-hour targets:

| Metric | Target | Why it matters |
|---|---:|---|
| Unique planner opens | 100 | Enough qualified traffic to read the funnel |
| Five-set plans | 30 | The planner was understandable and useful |
| Wallpaper exports | 15 | The main promise was delivered |
| Native wallpaper shares | 3 | Early evidence of a distribution loop |
| Support-link opens | Track only | Revenue intent, not the launch goal |

No paid ads, paywall, or large feature work during this window.

## Positioning

**Audience:** Tomorrowland Belgium 2026 attendees planning W1 or W2 on a phone.

**Problem:** favorites and notes do not become one glanceable route during the festival.

**Promise:** choose Must, Want, or Maybe and take the finished day on your lock screen.

**Why FestFrame now:** the official app already provides favorites and a personal schedule. FestFrame wins on export quality, priorities, and an artifact that stays visible without reopening an app. Current community threads also show demand for clearer timetable images and frustration when favorites are reset.

Evidence: [official app listing](https://play.google.com/store/apps/details?id=com.tomorrowland.tomorrowland), [schedule/favorites discussion](https://www.reddit.com/r/Tomorrowland/comments/1uceaql/tomorrowland_app_schedule/), [visual timetable request](https://www.reddit.com/r/Tomorrowland/comments/1uqzoc1/has_anyone_made_something_similar_to_this/).

## Sequence

### 16 July: festival eve

1. Record one 9:16 screen capture: tap an artist, change one to Must, open My Schedule, export Botanical, show the result as a lock screen.
2. Post to the Ukrainian attendee group and personal Instagram story first. Use the tagged URLs below.
3. Send the demo privately to 5 people already attending. Ask whether the wallpaper is readable, not whether they “like the app.”
4. Fix only broken timetable data, export failures, or unreadable mobile output.

### 17 July: W1 day one

1. Publish one Reddit post focused on the lock-screen result, after checking the subreddit rules and recent duplicate posts.
2. Post the real Friday wallpaper as the first image; put the UI screen second.
3. Reply quickly and directly to questions. State that FestFrame is free and unofficial.
4. At 18:00 Brussels time, inspect the funnel by source. Repost only the strongest artifact, not the same copy.

### 18-19 July: proof and iteration

1. Share one real user route with permission.
2. Use comments to learn the next job: W2 data accuracy, friend comparison, or more wallpaper formats.
3. Change the product only when the same issue appears at least three times.
4. Publish W2 content only after rechecking the W2 timetable snapshot.

## Tagged Links

- Ukrainian group: `https://festframe.vercel.app/?utm_source=telegram&utm_medium=community&utm_campaign=w1_launch&utm_content=ukraine_group`
- Reddit: `https://festframe.vercel.app/?utm_source=reddit&utm_medium=community&utm_campaign=w1_launch&utm_content=lockscreen_post`
- Instagram story: `https://festframe.vercel.app/?utm_source=instagram&utm_medium=social&utm_campaign=w1_launch&utm_content=story_demo`
- Creator link: replace the final value in `https://festframe.vercel.app/?utm_source=instagram&utm_medium=creator&utm_campaign=w1_launch&utm_content=creator_name`

Do not put email addresses or artist choices in UTM values.

## Copy Bank

### Ukrainian attendee group

> гайс, подумав, що на фестивалі було б зручно мати свій розклад прямо на шпалерах телефона, тому накидав невеликий сервіс під Tomorrowland
>
> можна вибрати Must / Want / Maybe, побачити накладки й додати все в календар
>
> можливо, комусь теж згодиться 🫶
> https://festframe.vercel.app/?utm_source=telegram&utm_medium=community&utm_campaign=w1_launch&utm_content=ukraine_group

### Reddit post

**Title:** I made a Tomorrowland schedule that turns your picks into a lock-screen wallpaper

> I wanted my Friday route visible without reopening an app every time, so I built a small free planner for Tomorrowland Belgium 2026.
>
> You can mark sets as Must / Want / Maybe, see clashes, then export the day as a lock-screen image, calendar file, or PDF. It covers W1 and W2 and the timetable snapshot is dated so it is still worth checking official updates.
>
> It is free, unofficial, and email is optional: [FestFrame](https://festframe.vercel.app/?utm_source=reddit&utm_medium=community&utm_campaign=w1_launch&utm_content=lockscreen_post)
>
> The lock-screen result is the part I care about most. Feedback on readability during the actual festival would be useful.

### Creator or group-admin DM

> Hey, I made a free Tomorrowland planner that turns Must / Want / Maybe picks into a lock-screen wallpaper. Your audience is already planning routes, so I thought the output might genuinely help. I can send a clean 10-second demo and a tagged link; no scripted endorsement needed. If it is not useful, no worries.

### Instagram/TikTok caption

> POV: your Tomorrowland route is finally where you can see it. Pick the sets, spot the clashes, export the lock screen. Free and unofficial. FestFrame.

## Creative Specification

- Format: 9:16, 8-12 seconds, screen recording plus final lock screen.
- First frame: completed Botanical wallpaper, not the email screen.
- On-screen text: `Tomorrowland route → lock screen`.
- Sequence: select → Must/Want/Maybe → My Schedule → export → lock screen.
- Keep `MADE WITH FESTFRAME` visible in the final two seconds.
- Never use the official Tomorrowland logo or imply endorsement.

## Measurement

First-party Neon events are the decision source; Vercel Web Analytics is the traffic sanity check.

```sql
-- Funnel by unique session, last 72 hours
SELECT event_name, count(DISTINCT session_id) AS sessions
FROM product_events
WHERE created_at >= now() - interval '72 hours'
GROUP BY event_name
ORDER BY sessions DESC;

-- Acquisition quality by source
SELECT coalesce(properties->>'utm_source', 'direct') AS source,
       count(DISTINCT session_id) FILTER (WHERE event_name = 'planner_opened') AS opened,
       count(DISTINCT session_id) FILTER (WHERE event_name = 'five_artists_selected') AS five_sets,
       count(DISTINCT session_id) FILTER (WHERE event_name = 'wallpaper_exported') AS exported,
       count(DISTINCT session_id) FILTER (WHERE event_name = 'wallpaper_shared') AS shared
FROM product_events
WHERE created_at >= now() - interval '72 hours'
GROUP BY source
ORDER BY opened DESC;

-- Country mix without exposing personal data
SELECT country_code, count(DISTINCT session_id) AS sessions
FROM product_events
WHERE created_at >= now() - interval '72 hours'
GROUP BY country_code
ORDER BY sessions DESC;
```

Calculate conversion using unique sessions, not raw event counts.

## Decisions After 72 Hours

- **Exports at or above 15:** keep the product live and prepare W2 creator distribution.
- **Five-set plans strong, exports weak:** improve the export preview and CTA before adding features.
- **Exports strong, shares weak:** improve the share wording and make the finished image easier to preview.
- **Repeated friend-alignment requests:** prototype importable route links before real-time rooms.
- **Support clicks but few contributions:** test a one-time premium wallpaper pack after W2, not a subscription.
- **Low activation from every source:** do not buy traffic; simplify selection and verify timetable relevance.

## Launch Guardrails

- Check the current subreddit rules before posting and do not hijack unrelated threads.
- Do not send marketing email to captured addresses without a separate opt-in.
- Do not activate Meta Pixel before consent UI and a documented purpose exist.
- Keep “unofficial” visible and direct users to the official timetable for live changes.
- Pause promotion immediately if timetable data or exported times are wrong.
