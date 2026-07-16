/// <reference types="node" />

import { createHash } from 'node:crypto'
import { neon } from '@neondatabase/serverless'

type Priority = 'critical' | 'want' | 'like'
type PlanPayload = {
  email?: unknown
  priorities?: unknown
  weekend?: unknown
  wallpaperTheme?: unknown
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

function normalizedEmail(value: unknown) {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  return email.length <= 254 && /^\S+@\S+\.\S+$/.test(email) ? email : null
}

function emailHash(email: string) {
  return createHash('sha256').update(email).digest('hex')
}

function validPriorities(value: unknown): value is Record<string, Priority> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const entries = Object.entries(value)
  return entries.length <= 1000 && entries.every(([id, priority]) => (
    id.length > 0 && id.length <= 200 && (priority === 'critical' || priority === 'want' || priority === 'like')
  ))
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST' && request.method !== 'PUT') return json({ error: 'Method not allowed' }, 405)
    if (!process.env.AUTHDB_DATABASE_URL) return json({ error: 'Plan storage not configured' }, 503)
    if (Number(request.headers.get('content-length') || 0) > 120_000) return json({ error: 'Payload too large' }, 413)

    let body: PlanPayload
    try {
      body = await request.json() as PlanPayload
    } catch {
      return json({ error: 'Invalid JSON' }, 400)
    }

    const email = normalizedEmail(body.email)
    if (!email) return json({ error: 'Invalid email' }, 400)
    const lookup = emailHash(email)
    const sql = neon(process.env.AUTHDB_DATABASE_URL)

    try {
      if (request.method === 'POST') {
        const rows = await sql`SELECT priorities, weekend, wallpaper_theme AS "wallpaperTheme"
          FROM festframe_email_plans WHERE email_hash = ${lookup} LIMIT 1`
        return json({ plan: rows[0] || null })
      }

      if (!validPriorities(body.priorities)) return json({ error: 'Invalid priorities' }, 400)
      if (body.weekend !== 'w1' && body.weekend !== 'w2') return json({ error: 'Invalid weekend' }, 400)
      if (body.wallpaperTheme !== 'consciousness-desert' && body.wallpaperTheme !== 'botanical-consciousness') return json({ error: 'Invalid wallpaper theme' }, 400)

      const prioritiesJson = JSON.stringify(body.priorities)
      await sql`INSERT INTO festframe_email_plans (email_hash, priorities, weekend, wallpaper_theme)
        VALUES (${lookup}, ${prioritiesJson}::jsonb, ${body.weekend}, ${body.wallpaperTheme})
        ON CONFLICT (email_hash) DO UPDATE SET
          priorities = EXCLUDED.priorities,
          weekend = EXCLUDED.weekend,
          wallpaper_theme = EXCLUDED.wallpaper_theme,
          updated_at = now()`
      return json({ saved: true })
    } catch {
      return json({ error: 'Plan could not be stored' }, 503)
    }
  },
}
