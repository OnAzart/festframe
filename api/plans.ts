/// <reference types="node" />

import { neon } from '@neondatabase/serverless'
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

type Priority = 'critical' | 'want' | 'like'
type PlanPayload = {
  priorities?: unknown
  weekend?: unknown
  wallpaperTheme?: unknown
}

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

function countryCode(request: Request) {
  const value = request.headers.get('x-vercel-ip-country')?.toUpperCase()
  return value && /^[A-Z]{2}$/.test(value) ? value : null
}

async function authenticatedUser(request: Request): Promise<JWTPayload | null> {
  const authUrl = process.env.AUTHDB_NEON_AUTH_BASE_URL
  const authorization = request.headers.get('authorization')
  if (!authUrl || !authorization?.startsWith('Bearer ')) return null

  try {
    jwks ||= createRemoteJWKSet(new URL(`${authUrl}/.well-known/jwks.json`))
    const { payload } = await jwtVerify(authorization.slice(7), jwks, {
      issuer: authUrl,
      audience: new URL(authUrl).origin,
    })
    return typeof payload.sub === 'string' && payload.sub !== 'anonymous' ? payload : null
  } catch {
    return null
  }
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
    if (request.method !== 'GET' && request.method !== 'PUT') return json({ error: 'Method not allowed' }, 405)
    if (!process.env.AUTHDB_DATABASE_URL) return json({ error: 'Plan storage not configured' }, 503)

    const user = await authenticatedUser(request)
    if (!user?.sub) return json({ error: 'Authentication required' }, 401)

    const sql = neon(process.env.AUTHDB_DATABASE_URL)
    const country = countryCode(request)
    const email = typeof user.email === 'string' && /^\S+@\S+\.\S+$/.test(user.email) ? user.email.toLowerCase() : null

    try {
      await sql`INSERT INTO festframe_profiles (user_id, email, country_code)
        VALUES (${user.sub}, ${email}, ${country})
        ON CONFLICT (user_id) DO UPDATE SET
          email = COALESCE(EXCLUDED.email, festframe_profiles.email),
          country_code = COALESCE(festframe_profiles.country_code, EXCLUDED.country_code),
          updated_at = now()`

      if (request.method === 'GET') {
        const rows = await sql`SELECT priorities, weekend, wallpaper_theme AS "wallpaperTheme", updated_at AS "updatedAt"
          FROM saved_plans WHERE user_id = ${user.sub} LIMIT 1`
        return json({ plan: rows[0] || null })
      }

      if (Number(request.headers.get('content-length') || 0) > 120_000) return json({ error: 'Payload too large' }, 413)
      let body: PlanPayload
      try {
        body = await request.json() as PlanPayload
      } catch {
        return json({ error: 'Invalid JSON' }, 400)
      }

      if (!validPriorities(body.priorities)) return json({ error: 'Invalid priorities' }, 400)
      if (body.weekend !== 'w1' && body.weekend !== 'w2') return json({ error: 'Invalid weekend' }, 400)
      if (body.wallpaperTheme !== 'consciousness-desert' && body.wallpaperTheme !== 'botanical-consciousness') return json({ error: 'Invalid wallpaper theme' }, 400)

      const prioritiesJson = JSON.stringify(body.priorities)
      await sql`INSERT INTO saved_plans (user_id, priorities, weekend, wallpaper_theme)
        VALUES (${user.sub}, ${prioritiesJson}::jsonb, ${body.weekend}, ${body.wallpaperTheme})
        ON CONFLICT (user_id) DO UPDATE SET
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
