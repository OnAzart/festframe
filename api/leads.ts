/// <reference types="node" />

import { neon } from '@neondatabase/serverless'

type LeadPayload = {
  visitorId?: unknown
  email?: unknown
  marketingConsent?: unknown
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

function countryCode(request: Request) {
  const value = request.headers.get('x-vercel-ip-country')?.toUpperCase()
  return value && /^[A-Z]{2}$/.test(value) ? value : null
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
    if (!process.env.AUTHDB_DATABASE_URL) return json({ error: 'Lead storage not configured' }, 503)
    if (Number(request.headers.get('content-length') || 0) > 2048) return json({ error: 'Payload too large' }, 413)

    let body: LeadPayload
    try {
      body = await request.json() as LeadPayload
    } catch {
      return json({ error: 'Invalid JSON' }, 400)
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const marketingConsent = body.marketingConsent === true
    if (typeof body.visitorId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.visitorId)) return json({ error: 'Invalid visitor' }, 400)
    if (email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Invalid email' }, 400)

    try {
      const sql = neon(process.env.AUTHDB_DATABASE_URL)
      await sql`INSERT INTO festframe_leads (visitor_id, email, country_code, marketing_consent, marketing_consent_at, privacy_version)
        VALUES (${body.visitorId}::uuid, ${email}, ${countryCode(request)}, ${marketingConsent}, ${marketingConsent ? new Date().toISOString() : null}::timestamptz, ${'2026-07-18'})
        ON CONFLICT (visitor_id) DO UPDATE SET
          email = EXCLUDED.email,
          country_code = COALESCE(festframe_leads.country_code, EXCLUDED.country_code),
          marketing_consent = EXCLUDED.marketing_consent,
          marketing_consent_at = CASE WHEN EXCLUDED.marketing_consent THEN COALESCE(festframe_leads.marketing_consent_at, EXCLUDED.marketing_consent_at) ELSE festframe_leads.marketing_consent_at END,
          privacy_version = EXCLUDED.privacy_version,
          updated_at = now()`
      return json({ accepted: true }, 202)
    } catch {
      return json({ error: 'Email could not be stored' }, 503)
    }
  },
}
