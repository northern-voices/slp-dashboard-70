import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { email, inviteLink } = await req.json()

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f9; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px;">

              <!-- Logo / Header -->
              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">
                    Northern Voices Speech Services
                  </span>
                </td>
              </tr>

              <!-- Card -->
              <tr>
                <td style="background-color: #ffffff; border-radius: 12px; padding: 40px 36px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

                  <!-- Icon -->
                  <div style="text-align: center; margin-bottom: 24px;">
                    <div style="display: inline-block; background-color: #EEF4FF; border-radius: 50%; padding: 14px;">
                      <img src="https://img.icons8.com/ios-filled/24/005AE0/add-user-male.png" width="24" height="24" alt="" />
                    </div>
                  </div>

                  <!-- Title -->
                  <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #111827; text-align: center;">
                    You've been invited
                  </h1>
                  <p style="margin: 0 0 32px; font-size: 15px; color: #6B7280; text-align: center; line-height: 1.5;">
                    You've been invited to join Northern Voices Speech Services.<br/>
                    Click the button below to set up your account.
                  </p>

                  <!-- CTA Button -->
                  <div style="text-align: center; margin-bottom: 32px;">
                    <a href="${inviteLink}" style="display: inline-block; background-color: #005AE0; color: #ffffff; font-size: 15px; font-weight: 600;
  text-decoration: none; padding: 12px 32px; border-radius: 8px;">
                      Accept Invitation
                    </a>
                  </div>

                  <!-- Expiry note -->
                  <p style="margin: 0 0 24px; font-size: 13px; color: #9CA3AF; text-align: center;">
                    This invitation link will expire in 24 hours.
                  </p>

                  <!-- Warning -->
                  <p style="margin: 0; font-size: 13px; color: #9CA3AF; text-align: center; line-height: 1.6;">
                    If you weren't expecting an invitation, you can safely ignore this email.
                  </p>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding-top: 24px;">
                  <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
    &copy; 2026 Northern Voices. All rights reserved.
  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@northern-voices.com',
      to: email,
      subject: "You've been invited to Northern Voices Speech Services",
      html,
    }),
  })

  const data = await res.json()
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
