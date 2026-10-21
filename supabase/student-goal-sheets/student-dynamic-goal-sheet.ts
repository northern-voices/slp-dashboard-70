// supabase/student-goal-sheets/student-dynamic-goal-sheet.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { AwsClient } from 'npm:aws4fetch@1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.info('Student dynamic goal sheet function started')

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function createReportToken({
  supabaseUrl,
  supabaseKey,
  password,
  reportType,
  reportData,
  studentId,
  schoolId,
  createdBy,
}: {
  supabaseUrl: string
  supabaseKey: string
  password: string
  reportType: string
  reportData: unknown
  studentId?: string | null
  schoolId?: string | null
  createdBy?: string | null
}) {
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
      student_id: studentId ?? null,
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

async function sendReportLinkEmail({
  recipients,
  subject,
  reportLabel,
  link,
}: {
  recipients: string[]
  subject: string
  reportLabel: string
  link: string
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
                    Below you'll find a secure link to ${reportLabel}. You'll need the password provided to you separately to open it.
                  </p>
                  <div style="text-align: center; margin-bottom: 32px;">
                    <a href="${link}" style="display: inline-block; background-color: #005AE0; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px;">
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
  params.set('Source', senderEmail ?? '')
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

function createDocumentObject(studentName: string, goalSheet: any) {
  return {
    metadata: { file_name: `${studentName} - NVSS Dynamic Goal Sheet` },
    template: { name: 'Dynamic Goal Sheet', version: 1 },
    context: {
      student_name: studentName,
      pages: [...goalSheet.pages]
        .sort((a: any, b: any) => a.page_number - b.page_number)
        .map((page: any) => ({
          page_number: page.page_number,
          goal_text: page.goal_text,
          sessions: [...page.sessions].sort(
            (a: any, b: any) => a.session_number - b.session_number
          ),
        })),
    },
  }
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const { dynamic_goal_sheet_id, override_emails, generated_by, password } = await req.json()

    if (!dynamic_goal_sheet_id) {
      throw new Error('dynamic_goal_sheet_id is required')
    }
    if (!password) {
      throw new Error('password is required')
    }
    const recipientEmails = Array.isArray(override_emails) ? override_emails.filter(Boolean) : []
    if (recipientEmails.length === 0) {
      throw new Error('At least one recipient email is required')
    }

    console.log(`Processing dynamic goal sheet: ${dynamic_goal_sheet_id}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const sheetUrl = `${supabaseUrl}/rest/v1/dynamic_goal_sheets?id=eq.${dynamic_goal_sheet_id}&select=*,student:students(id,first_name,last_name),pages:dynamic_goal_sheet_pages(*,sessions:dynamic_goal_sheet_sessions(*))`
    const sheetResponse = await fetch(sheetUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })
    if (!sheetResponse.ok) {
      throw new Error(`Failed to fetch dynamic goal sheet: ${sheetResponse.status}`)
    }
    const sheets = await sheetResponse.json()
    if (!sheets || sheets.length === 0) {
      throw new Error('Dynamic goal sheet not found')
    }
    const goalSheet = sheets[0]
    const studentName = `${goalSheet.student.first_name} ${goalSheet.student.last_name}`

    console.log(`Found dynamic goal sheet for student: ${studentName}`)

    const documentObject = createDocumentObject(studentName, goalSheet)

    const token = await createReportToken({
      supabaseUrl,
      supabaseKey,
      password,
      reportType: 'dynamic_goal_sheet',
      reportData: documentObject,
      studentId: goalSheet.student_id,
      schoolId: goalSheet.school_id,
      createdBy: generated_by,
    })

    const link = `${Deno.env.get('APP_BASE_URL')}/view-report/${token}`

    console.log(`Sending secure report link to ${recipientEmails.join(', ')}...`)

    await sendReportLinkEmail({
      recipients: recipientEmails,
      subject: 'NVSS Student Goal Sheet',
      reportLabel: `${studentName}'s goal sheet`,
      link,
    })

    console.log('Secure report link sent successfully')

    await fetch(`${supabaseUrl}/rest/v1/reports`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_id: goalSheet.student_id,
        school_id: goalSheet.school_id,
        report_type: 'dynamic_goal_sheet',
        file_key: `dynamic_goal_sheet_${dynamic_goal_sheet_id}`,
        generated_by: generated_by || null,
        metadata: {
          sent_to: recipientEmails,
          delivery_method: 'password_protected_link',
          report_token: token,
        },
      }),
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: `Goal sheet generated and a secure link sent to ${recipientEmails.join(', ')}`,
        student_name: studentName,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error generating dynamic goal sheet report:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
