import process from 'node:process'
import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL || !process.env.AUTHDB_DATABASE_URL) {
  try {
    process.loadEnvFile('.env.local')
  } catch {
    // Environment variables may already be supplied by the caller.
  }
}

if (!process.env.DATABASE_URL || !process.env.AUTHDB_DATABASE_URL) {
  throw new Error('DATABASE_URL and AUTHDB_DATABASE_URL are required')
}

const since = process.argv[2] || '2026-07-15'
if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) throw new Error('Use a YYYY-MM-DD start date')

const eventsSql = neon(process.env.DATABASE_URL)
const plansSql = neon(process.env.AUTHDB_DATABASE_URL)
const likelyRealEmail = (email) => email && !/@example\.com$|@test\.com$|^festframe-/i.test(email)

const [summary, funnel, daily, countries, sources, rawPlans, rawSelections] = await Promise.all([
  eventsSql`SELECT count(*)::int AS events,
    count(DISTINCT session_id)::int AS sessions,
    count(DISTINCT visitor_id)::int AS tracked_visitors
    FROM product_events WHERE created_at >= ${since}::timestamptz`,
  eventsSql`SELECT event_name,
    count(*)::int AS events,
    count(DISTINCT session_id)::int AS sessions,
    count(DISTINCT visitor_id)::int AS visitors
    FROM product_events WHERE created_at >= ${since}::timestamptz
    GROUP BY event_name ORDER BY sessions DESC`,
  eventsSql`SELECT created_at::date::text AS day,
    count(DISTINCT session_id)::int AS sessions,
    count(DISTINCT visitor_id)::int AS visitors,
    count(DISTINCT session_id) FILTER (WHERE event_name = 'wallpaper_exported')::int AS wallpaper_sessions,
    count(DISTINCT session_id) FILTER (WHERE event_name = 'wallpaper_shared')::int AS share_sessions
    FROM product_events WHERE created_at >= ${since}::timestamptz
    GROUP BY day ORDER BY day`,
  eventsSql`SELECT coalesce(country_code::text, '--') AS country,
    count(DISTINCT session_id)::int AS sessions
    FROM product_events WHERE created_at >= ${since}::timestamptz
    GROUP BY country ORDER BY sessions DESC LIMIT 12`,
  eventsSql`SELECT coalesce(properties->>'utm_source', 'direct') AS source,
    count(DISTINCT session_id)::int AS opened_sessions
    FROM product_events
    WHERE created_at >= ${since}::timestamptz AND event_name = 'planner_opened'
    GROUP BY source ORDER BY opened_sessions DESC`,
  plansSql`SELECT email, priorities, weekend, wallpaper_theme, created_at, updated_at
    FROM festframe_email_plans WHERE created_at >= ${since}::timestamptz`,
  plansSql`SELECT f.email, p.key AS performance_id, p.value AS priority
    FROM festframe_email_plans f CROSS JOIN LATERAL jsonb_each_text(f.priorities) p
    WHERE f.weekend = 'w2' AND f.created_at >= ${since}::timestamptz`,
])

const plans = rawPlans.filter((plan) => likelyRealEmail(plan.email)).map((plan) => ({
  ...plan,
  setCount: Object.keys(plan.priorities || {}).length,
}))
const nonemptyPlans = plans.filter((plan) => plan.setCount > 0)
const w2Plans = plans.filter((plan) => plan.weekend === 'w2')
const sortedW2Counts = w2Plans.map((plan) => plan.setCount).sort((a, b) => a - b)
const medianIndex = Math.floor(sortedW2Counts.length / 2)
const medianW2 = !sortedW2Counts.length ? 0 : sortedW2Counts.length % 2
  ? sortedW2Counts[medianIndex]
  : (sortedW2Counts[medianIndex - 1] + sortedW2Counts[medianIndex]) / 2

console.log(`FestFrame analytics since ${since}`)
console.table(summary)
console.log('Funnel')
console.table(funnel)
console.log('Daily usage')
console.table(daily)
console.log('Top countries')
console.table(countries)
console.log('Acquisition')
console.table(sources)
console.log('Email plan quality (obvious test addresses excluded)')
console.table([{
  profiles: plans.length,
  nonempty: nonemptyPlans.length,
  w2_profiles: w2Plans.length,
  w2_meaningful: w2Plans.filter((plan) => plan.setCount >= 5).length,
  w2_median_sets: medianW2,
  cross_day_updates: plans.filter((plan) => new Date(plan.updated_at).toISOString().slice(0, 10) > new Date(plan.created_at).toISOString().slice(0, 10)).length,
}])

const w2Data = JSON.parse(await readFile('public/data/tomorrowland-2026-w2.json', 'utf8'))
const performanceById = new Map(w2Data.performances.map((performance) => [String(performance.id), performance]))
const picks = new Map()
const countedProfileArtists = new Set()
for (const row of rawSelections.filter((selection) => likelyRealEmail(selection.email))) {
  const performance = performanceById.get(String(row.performance_id))
  if (!performance) continue
  const artist = performance.name || performance.artists?.map((item) => item.name).join(' b2b ') || row.performance_id
  const profileArtist = `${row.email}\0${artist}`
  if (countedProfileArtists.has(profileArtist)) continue
  countedProfileArtists.add(profileArtist)
  const current = picks.get(artist) || { artist, profiles: 0, must: 0, want: 0, maybe: 0 }
  current.profiles += 1
  current[row.priority === 'critical' ? 'must' : row.priority === 'like' ? 'maybe' : 'want'] += 1
  picks.set(artist, current)
}
console.log('Top W2 picks (internal directional signal; sample is small)')
console.table([...picks.values()].sort((left, right) => right.profiles - left.profiles || right.must - left.must).slice(0, 12))
