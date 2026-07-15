/// <reference types="node" />

import { neon } from '@neondatabase/serverless'

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405)
    if (!process.env.DATABASE_URL) return json({ status: 'not_configured' }, 503)

    try {
      const sql = neon(process.env.DATABASE_URL)
      await sql`SELECT 1 AS connected`
      return json({ status: 'ok', service: 'neon' })
    } catch {
      return json({ status: 'unavailable' }, 503)
    }
  },
}
