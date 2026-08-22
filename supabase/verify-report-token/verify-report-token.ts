// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_FAILED_ATTEMPTS = 10

console.info('Verify report token function started')

// Hash a password with SHA-256, matching how each send-report edge function hashes it
async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token, password } = await req.json()

    if (!token) {
      throw new Error('token is required')
    }
    if (!password) {
      throw new Error('password is required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // 1. Look up the token
    const lookupUrl = `${supabaseUrl}/rest/v1/report_tokens?token=eq.${token}&select=*`
    const lookupResponse = await fetch(lookupUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!lookupResponse.ok) {
      throw new Error(`Failed to look up report token: ${lookupResponse.status}`)
    }

    const rows = await lookupResponse.json()
    if (!rows || rows.length === 0) {
      return jsonResponse({ success: false, error: 'not_found' })
    }

    const reportToken = rows[0]

    // 2. Check lock / expiry before touching the password at all
    if (reportToken.locked_at || reportToken.failed_attempts >= MAX_FAILED_ATTEMPTS) {
      return jsonResponse({ success: false, error: 'locked' })
    }

    if (new Date(reportToken.expires_at).getTime() < Date.now()) {
      return jsonResponse({ success: false, error: 'expired' })
    }

    // 3. Check password
    const passwordHash = await hashPassword(password)

    if (passwordHash !== reportToken.password_hash) {
      const newFailedAttempts = (reportToken.failed_attempts || 0) + 1
      const shouldLock = newFailedAttempts >= MAX_FAILED_ATTEMPTS

      await fetch(`${supabaseUrl}/rest/v1/report_tokens?id=eq.${reportToken.id}`, {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          failed_attempts: newFailedAttempts,
          ...(shouldLock ? { locked_at: new Date().toISOString() } : {}),
        }),
      })

      return jsonResponse({ success: false, error: shouldLock ? 'locked' : 'invalid_password' })
    }

    // 4. Correct password - record access and return the report data
    await fetch(`${supabaseUrl}/rest/v1/report_tokens?id=eq.${reportToken.id}`, {
      method: 'PATCH',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        accessed_at: reportToken.accessed_at ?? new Date().toISOString(),
        access_count: (reportToken.access_count || 0) + 1,
        failed_attempts: 0,
      }),
    })

    return jsonResponse({
      success: true,
      report_type: reportToken.report_type,
      report_data: reportToken.report_data,
    })
  } catch (error) {
    console.error('Error verifying report token:', error)
    return jsonResponse({ success: false, error: error.message }, 400)
  }
})
