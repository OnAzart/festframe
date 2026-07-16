# FestFrame SEO Checklist

Updated 16 July 2026.

## Search Position

Do not try to outrank the official app for a generic “Tomorrowland app” query. It already owns favorites and personalized schedules. FestFrame should match narrower intent:

- Tomorrowland 2026 planner
- Tomorrowland schedule wallpaper
- Tomorrowland lock screen timetable
- Tomorrowland calendar export
- Tomorrowland clash planner

The product title and description lead with “Tomorrowland 2026 Planner,” while the page and social copy differentiate on lock-screen output.

## Implemented

- [x] Descriptive title and meta description.
- [x] Canonical production URL.
- [x] Absolute Open Graph and Twitter image metadata with dimensions and alt text.
- [x] `WebSite` and `WebApplication` JSON-LD with a real zero-price offer.
- [x] Indexable `robots.txt` with API exclusion and sitemap reference.
- [x] XML sitemap for the planner, Privacy, and Terms pages.
- [x] Crawlable Privacy and Terms pages.
- [x] PWA manifest metadata.
- [x] HTTPS security and asset-cache headers.
- [x] `llms.txt` with concise product identity and canonical links.
- [x] First-party UTM and referring-hostname attribution.
- [x] Privacy disclosure for Vercel's aggregated, cookieless Web Analytics and Neon storage.
- [x] Production-sized 1200×630 social preview.

Google requires `name` and `offers.price` for SoftwareApplication eligibility, recommends validating schema, and does not guarantee a rich result. The implementation follows the current [SoftwareApplication documentation](https://developers.google.com/search/docs/appearance/structured-data/software-app) without inventing ratings or reviews. The sitemap contains only canonical public URLs, following [Google's sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Manual Actions

These require the owner's external accounts and cannot be completed from the repository:

1. Add `https://festframe.vercel.app` as a URL-prefix property in Google Search Console.
2. Verify ownership, submit `https://festframe.vercel.app/sitemap.xml`, and request indexing for the homepage.
3. Run the production URL through Google Rich Results Test and URL Inspection after deployment.
4. Test the homepage in PageSpeed Insights on mobile; prioritize real Core Web Vitals over a perfect lab score.
5. Preview `og-image.png` with LinkedIn Post Inspector and Facebook Sharing Debugger.
6. Add the canonical URL to the GitHub repository description and relevant social profiles.
7. Re-submit the homepage after meaningful timetable or product changes, not cosmetic edits.

## Next SEO Work Only After Validation

- Add festival-specific pages only when FestFrame supports another real festival with accurate data and a useful export. Avoid thin template pages.
- Move to a short custom domain if users remember and type FestFrame; preserve the Vercel URL with a permanent redirect and update canonical URLs.
- Publish a real post-event write-up using aggregate data, such as the most common clash hour, without exposing email or individual artist plans.
- Add verified user quotes only after receiving permission. Do not create fake ratings for schema.

## Release Check

```bash
npm run verify
curl -I https://festframe.vercel.app/
curl -fsS https://festframe.vercel.app/robots.txt
curl -fsS https://festframe.vercel.app/sitemap.xml
```
