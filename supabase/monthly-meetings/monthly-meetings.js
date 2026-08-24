// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { AwsClient } from 'npm:aws4fetch@1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.info('Monthly meetings function started')

// Hash a password with SHA-256, matching what verify-report-token compares against
async function hashPassword(password) {
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
  studentId,
  schoolId,
  createdBy,
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

// Send a link-only notification email via AWS SES (bypasses the doc-gen Lambda,
// which always attaches a real generated PDF whenever it emails - no way to suppress that)
async function sendReportLinkEmail({ recipients, subject, reportLabel, viewUrl }) {
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
  params.set('Source', senderEmail)
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

Deno.serve(async req => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { monthly_meeting_id, override_emails, generated_by, password } = await req.json()

    if (!monthly_meeting_id) {
      return new Response(
        JSON.stringify({
          error: 'monthly_meeting_id is required',
          success: false,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 400,
        }
      )
    }
    if (!Array.isArray(override_emails) || override_emails.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'override_emails is required',
          success: false,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 400,
        }
      )
    }
    if (!password) {
      throw new Error('password is required')
    }

    console.log(`Processing monthly meeting document for meeting: ${monthly_meeting_id}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // 1. Get monthly meeting information
    const meetingUrl = `${supabaseUrl}/rest/v1/monthly_meetings?id=eq.${monthly_meeting_id}&select=*`
    const meetingResponse = await fetch(meetingUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!meetingResponse.ok) {
      throw new Error(`Failed to fetch monthly meeting: ${meetingResponse.status}`)
    }

    const meetings = await meetingResponse.json()
    if (!meetings || meetings.length === 0) {
      throw new Error('Monthly meeting not found')
    }

    const meeting = meetings[0]
    console.log(`Found meeting: ${meeting.meeting_title}`)
    console.log('Meeting additional_notes:', meeting.additional_notes)
    console.log('Meeting action_plan:', meeting.action_plan)

    // 2. Get facilitator information
    let facilitatorName = 'N/A'
    if (meeting.facilitator_id) {
      const facilitatorUrl = `${supabaseUrl}/rest/v1/users?id=eq.${meeting.facilitator_id}&select=first_name,last_name`
      const facilitatorResponse = await fetch(facilitatorUrl, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (facilitatorResponse.ok) {
        const facilitators = await facilitatorResponse.json()
        if (facilitators && facilitators.length > 0) {
          const facilitator = facilitators[0]
          facilitatorName = `${facilitator.first_name} ${facilitator.last_name}`
        }
      }
    }

    // 3. Get school information
    let schoolName = 'N/A'
    if (meeting.school_id) {
      const schoolUrl = `${supabaseUrl}/rest/v1/schools?id=eq.${meeting.school_id}&select=name`
      const schoolResponse = await fetch(schoolUrl, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (schoolResponse.ok) {
        const schools = await schoolResponse.json()
        if (schools && schools.length > 0) {
          const school = schools[0]
          schoolName = school.name
        }
      }
    }

    // 4. Get student updates for this meeting
    const studentUpdatesUrl = `${supabaseUrl}/rest/v1/monthly_meeting_student_updates?monthly_meeting_id=eq.${monthly_meeting_id}&select=*,students(first_name,last_name,program_status)`
    const studentUpdatesResponse = await fetch(studentUpdatesUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!studentUpdatesResponse.ok) {
      throw new Error(`Failed to fetch student updates: ${studentUpdatesResponse.status}`)
    }

    const studentUpdatesRaw = await studentUpdatesResponse.json()
    console.log(`Found ${studentUpdatesRaw.length} student updates`)
    console.log('Raw student updates:', JSON.stringify(studentUpdatesRaw, null, 2))

    // 5. Process student updates
    const studentUpdates = studentUpdatesRaw.map(update => ({
      student_id: update.student_id,
      student_name: `${update.students.first_name} ${update.students.last_name}`,
      sessions_attended: update.sessions_attended || 0,
      meeting_notes: update.meeting_notes || '',
      is_sub: update.students?.program_status === 'sub',
    }))

    console.log('Processed student updates:', JSON.stringify(studentUpdates, null, 2))

    // 6. Format meeting date
    const formattedMeetingDate = new Date(meeting.meeting_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // 7. Create document object for the template
    const isProgressCheckin = meeting.meeting_type === 'progress_checkin'
    const templateName = isProgressCheckin ? 'Monthly Meetings' : 'Coaching Call School Summary'

    const documentObject = {
      metadata: {
        file_name: `Monthly_Meeting-${meeting.meeting_title.replace(/[^a-zA-Z0-9]/g, '_')}-${
          meeting.meeting_date
        }`,
        directory: 'Monthly Meetings',
      },
      template: {
        name: templateName,
        version: 1,
      },
      context: {
        meeting_title: meeting.meeting_title,
        facilitator_name: facilitatorName,
        school: schoolName,
        meeting_date: formattedMeetingDate,
        attendees: meeting.attendees || [],
        has_student_updates: studentUpdates.length > 0,
        student_updates: studentUpdates,
        has_topics: !!meeting.topics && meeting.topics.trim() !== '',
        topics: meeting.topics || '',
        has_visit_purpose: !!meeting.school_visit_purpose && meeting.school_visit_purpose.trim() !== '',
        school_visit_purpose: meeting.school_visit_purpose || '',
        has_action_plan: !!meeting.action_plan && meeting.action_plan.trim() !== '',
        action_plan: meeting.action_plan || '',
        has_additional_notes: !!meeting.additional_notes && meeting.additional_notes.trim() !== '',
        additional_notes: meeting.additional_notes || '',
      },
    }

    console.log('Document object created:', JSON.stringify(documentObject, null, 2))

    // 8. Create a password-protected report token instead of emailing the PDF directly
    //    (the doc-gen Lambda never returns PDF bytes and always attaches a real PDF
    //    whenever it emails, so it can't be used for a link-only notification)
    const token = await createReportToken({
      supabaseUrl,
      supabaseKey,
      password,
      reportType: 'monthly_meeting_report',
      reportData: documentObject,
      schoolId: meeting.school_id,
      createdBy: generated_by,
    })

    const viewUrl = `${Deno.env.get('APP_BASE_URL')}/view-report/${token}`

    const meetingLabel = MEETING_TYPE_LABELS[meeting.meeting_type] || 'Monthly Meeting Notes'

    console.log(`Sending secure report link to ${override_emails.join(', ')}...`)

    await sendReportLinkEmail({
      recipients: override_emails,
      subject: `${meetingLabel} - ${meeting.meeting_title} - ${formattedMeetingDate}`,
      reportLabel: `the ${meetingLabel.toLowerCase()} for "${meeting.meeting_title}"`,
      viewUrl,
    })

    console.log('Secure report link sent successfully')

    // 10. Log the generation in reports table
    const reportInsertUrl = `${supabaseUrl}/rest/v1/reports`
    await fetch(reportInsertUrl, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        school_id: meeting.school_id,
        report_type: 'monthly_meeting',
        file_key: `monthly_meeting_${monthly_meeting_id}`,
        generated_by: generated_by || null,
        metadata: {
          sent_to: override_emails,
          meeting_title: meeting.meeting_title,
          meeting_date: meeting.meeting_date,
          student_count: studentUpdates.length,
          delivery_method: 'password_protected_link',
          report_token: token,
        },
      }),
    })

    // IMPORTANT: Return response with CORS headers
    return new Response(
      JSON.stringify({
        success: true,
        message: `Monthly meeting document generated and a secure link sent to ${override_emails.join(', ')}`,
        meeting_title: meeting.meeting_title,
        meeting_date: formattedMeetingDate,
        student_updates_count: studentUpdates.length,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error generating monthly meeting document:', error)

    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})

const MEETING_TYPE_LABELS = {
  progress_checkin: 'Monthly Meeting Notes',
  coaching_call: 'Coaching Call Notes',
  school_visit_summary: 'School Visit Summary',
}
