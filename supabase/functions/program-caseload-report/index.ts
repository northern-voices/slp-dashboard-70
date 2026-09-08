// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { AwsClient } from 'npm:aws4fetch@1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.info('Program caseload report function started')

// Hash a password with SHA-256, matching what verify-report-token compares against
async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Create a report_tokens row and return the token to build the view link from
async function createReportToken({
  supabaseUrl,
  supabaseKey,
  password,
  reportType,
  reportData,
  schoolId,
  createdBy,
}: {
  supabaseUrl: string
  supabaseKey: string
  password: string
  reportType: string
  reportData: unknown
  schoolId?: string | null
  createdBy?: string | null
}): Promise<string> {
  const password_hash = await hashPassword(password)
  const token = crypto.randomUUID()

  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/report_tokens`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      token,
      password_hash,
      report_type: reportType,
      report_data: reportData,
      school_id: schoolId ?? null,
      created_by: createdBy ?? null,
    }),
  })

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text()
    throw new Error(`Failed to create report token: ${insertResponse.status} - ${errorText}`)
  }

  return token
}

// Send a link-only notification email via AWS SES (matches every other report's
// delivery method - never attaches a PDF directly, always a password-gated link)
async function sendReportLinkEmail({
  recipients,
  subject,
  reportLabel,
  viewUrl,
}: {
  recipients: string[]
  subject: string
  reportLabel: string
  viewUrl: string
}) {
  const accessKeyId = Deno.env.get('AWS_SES_ACCESS_KEY_ID')
  const secretAccessKey = Deno.env.get('AWS_SES_SECRET_ACCESS_KEY')
  const region = Deno.env.get('AWS_SES_REGION')
  const senderEmail = Deno.env.get('REPORT_SENDER_EMAIL')

  const aws = new AwsClient({ accessKeyId, secretAccessKey, region, service: 'ses' })

  const body = `
      <html>
      <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f9; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px;">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: #111827;">
                      Northern Voices Speech Services
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #ffffff; border-radius: 12px; padding: 40px 36px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="display: inline-block; background-color: #EEF4FF; border-radius: 50%; padding: 14px;">
                        <img src="https://img.icons8.com/ios-filled/24/005AE0/lock--v1.png" width="24" height="24" alt="" />
                      </div>
                    </div>
                    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #111827; text-align: center;">
                      Your Report is Ready
                    </h1>
                    <p style="margin: 0 0 32px; font-size: 15px; color: #6B7280; text-align: center; line-height: 1.5;">
                      A secure copy of ${reportLabel} is ready to view. You'll need the password provided to you separately to open it.
                    </p>
                    <div style="text-align: center; margin-bottom: 32px;">
                      <a href="${viewUrl}" style="display: inline-block; background-color: #005AE0; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px;">
                        View Report
                      </a>
                    </div>
                    <p style="margin: 0; font-size: 13px; color: #9CA3AF; text-align: center; line-height: 1.6;">
                      Warmest regards,<br />Lisa Brillinger &amp; the NVSS team
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 24px;">
                    <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                      &copy; ${new Date().getFullYear()} Northern Voices. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>`

  const params = new URLSearchParams()
  params.set('Action', 'SendEmail')
  params.set('Source', senderEmail!)
  recipients.forEach((email, i) => params.set(`Destination.ToAddresses.member.${i + 1}`, email))
  params.set('Message.Subject.Data', subject)
  params.set('Message.Body.Html.Data', body)

  const response = await aws.fetch(`https://email.${region}.amazonaws.com/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`SES send failed: ${response.status} - ${errorText}`)
  }
}
