// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.info('Verify email MFA function started')

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

// The gateway already verified this JWT's signature (verify_jwt = true for
// this function) - we're only reading claims out of it, not re-verifying.
function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const payload = jwt.split('.')[1]
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing Authorization header')
    }
    const callerClaims = decodeJwtPayload(authHeader.slice('Bearer '.length))
    const callerId = callerClaims.sub as string
    const callerEmail = callerClaims.email as string
    const callerSessionId = callerClaims.session_id as string

    const { email, token } = await req.json()
    if (!email || !token) {
      throw new Error('email and token are required')
    }
    if (email !== callerEmail) {
      throw new Error('Email does not match the signed-in user')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // 1. Verify the code against GoTrue - this is the one place allowed to
    // mint a session from it, and that session never leaves this function.
    const verifyResponse = await fetch(`${supabaseUrl}/auth/v1/verify`, {
      method: 'POST',
      headers: { apikey: anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'email', email, token }),
    })

    if (!verifyResponse.ok) {
      return jsonResponse({ success: false, error: 'invalid_code' }, 400)
    }

    const verifyData = await verifyResponse.json()

    if (verifyData.user?.id !== callerId) {
      throw new Error('Verified user does not match the signed-in session')
    }

    // 2. Immediately kill the session verify just created.
    if (verifyData.access_token) {
      await fetch(`${supabaseUrl}/auth/v1/logout?scope=global`, {
        method: 'POST',
        headers: { apikey: anonKey, Authorization: `Bearer ${verifyData.access_token}` },
      }).catch(error => console.error('Failed to revoke scratch session:', error))
    }

    // 3. Record that THIS session (the one the browser already has) has
    // completed email step-up. Service role bypasses RLS deliberately here.
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${callerId}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        email_mfa_verified_session_id: callerSessionId,
        email_mfa_verified_at: new Date().toISOString(),
      }),
    })

    if (!updateResponse.ok) {
      throw new Error(`Failed to record step-up: ${updateResponse.status}`)
    }

    return jsonResponse({ success: true })
  } catch (error) {
    console.error('Error verifying email MFA:', error)
    return jsonResponse({ success: false, error: error.message }, 400)
  }
})
