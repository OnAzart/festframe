import { createAuthClient } from '@neondatabase/auth'
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL

if (!authUrl && import.meta.env.VITE_E2E_AUTH_BYPASS !== 'true') {
  throw new Error('VITE_NEON_AUTH_URL is not configured')
}

export const authClient = createAuthClient(authUrl || 'http://127.0.0.1:5173/api/test-auth', {
  adapter: BetterAuthReactAdapter(),
})

export const authBypassEnabled = import.meta.env.VITE_E2E_AUTH_BYPASS === 'true'
