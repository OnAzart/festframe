/// <reference types="node" />

import { neon } from '@neondatabase/serverless'

const allowedEvents = new Set([
  'planner_opened',
  'signup_completed',
  'email_submitted',
  'plan_restored',
  'first_artist_selected',
  'five_artists_selected',
  'timeline_viewed',
  'calendar_exported',
  'pdf_exported',
  'wallpaper_exported',
  'wallpaper_shared',
  'support_opened',
])

type EventPayload = {
  sessionId?: unknown
  visitorId?: unknown
  eventName?: unknown
  festivalDate?: unknown
  weekend?: unknown
  properties?: unknown
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function countryCode(request: Request) {
  const value = request.headers.get('x-vercel-ip-country')?.toUpperCase()
  return value && /^[A-Z]{2}$/.test(value) ? value : null
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
    if (!process.env.DATABASE_URL) return json({ error: 'Database not configured' }, 503)
    if (Number(request.headers.get('content-length') || 0) > 4096) return json({ error: 'Payload too large' }, 413)

    let body: EventPayload
    try {
      body = await request.json() as EventPayload
    } catch {
      return json({ error: 'Invalid JSON' }, 400)
    }

    if (!isUuid(body.sessionId) || typeof body.eventName !== 'string' || !allowedEvents.has(body.eventName)) {
      return json({ error: 'Invalid event' }, 400)
    }
    if (body.visitorId !== undefined && !isUuid(body.visitorId)) return json({ error: 'Invalid visitor' }, 400)
    if (body.weekend !== undefined && body.weekend !== 'w1' && body.weekend !== 'w2') return json({ error: 'Invalid weekend' }, 400)
    if (body.festivalDate !== undefined && (typeof body.festivalDate !== 'string' || !/^2026-07-\d{2}$/.test(body.festivalDate))) return json({ error: 'Invalid date' }, 400)

    const properties = body.properties && typeof body.properties === 'object' && !Array.isArray(body.properties) ? body.properties : {}
    const propertiesJson = JSON.stringify(properties)
    if (propertiesJson.length > 1500) return json({ error: 'Properties too large' }, 413)

    try {
      const sql = neon(process.env.DATABASE_URL)
      await sql`INSERT INTO product_events (session_id, visitor_id, event_name, festival_date, weekend, country_code, properties)
        VALUES (${body.sessionId}::uuid, ${body.visitorId || null}::uuid, ${body.eventName}, ${body.festivalDate || null}::date, ${body.weekend || null}, ${countryCode(request)}, ${propertiesJson}::jsonb)`
      return json({ accepted: true }, 202)
    } catch {
      return json({ error: 'Event could not be stored' }, 503)
    }
  },
}
