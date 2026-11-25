// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { AwsClient } from 'npm:aws4fetch@1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.info('Hearing report function started')

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
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  try {
    // Parse request body
    const {
      hearing_screening_id,
      hearing_screening_ids,
      override_emails,
      generated_by,
      password,
      academic_year,
    } = await req.json()

    // Bulk "Email Reports" on the Screenings page sends a list of screenings: build every
    // selected student's hearing report and deliver them together behind one link, in one email
    if (Array.isArray(hearing_screening_ids) && hearing_screening_ids.length > 0) {
      return await handleBundledHearingReports({
        hearingScreeningIds: hearing_screening_ids,
        overrideEmails: override_emails,
        generatedBy: generated_by,
        password,
        academicYear: academic_year,
      })
    }

    if (!hearing_screening_id) {
      throw new Error('hearing_screening_id is required')
    }

    if (!password) {
      throw new Error('password is required')
    }

    console.log(`Processing hearing report for hearing screening: ${hearing_screening_id}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // 1. Get hearing screening with all related data
    const screeningUrl = `${supabaseUrl}/rest/v1/hearing_screenings?id=eq.${hearing_screening_id}&select=*,students(*,schools(*)),school_grades(*)`

    const screeningResponse = await fetch(screeningUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!screeningResponse.ok) {
      throw new Error(`Failed to fetch hearing screening: ${screeningResponse.status}`)
    }

    const screenings = await screeningResponse.json()

    if (!screenings || screenings.length === 0) {
      throw new Error('Hearing screening not found')
    }

    const screening = screenings[0]
    console.log(
      `Found hearing screening for student: ${screening.students.first_name} ${screening.students.last_name}`
    )

    // 2-3. Extract student info with all the result fields
    const studentInfo = buildHearingStudentInfo(screening)

    // 4. Require at least one recipient email (no staging table fallback available)
    if (!Array.isArray(override_emails) || override_emails.length === 0) {
      // Your students table doesn't have an email field
      // You might want to add one, or get it from a parent/guardian table
      // For now, throwing an error to require override_emails
      throw new Error(
        'Student email not found in database. Please provide override_emails parameter.'
      )
    }
    const recipientEmails = override_emails.filter(Boolean)
    studentInfo.email = recipientEmails[0]

    // 5. Create document object with dynamic template logic
    const documentObject = createDocumentObject(studentInfo)

    console.log(`Template selected: ${documentObject.template.name}`)
    console.log(
      `Right ear result: ${studentInfo.right_ear_result}, Left ear result: ${studentInfo.left_ear_result}`
    )

    // 6. Create a password-protected report token instead of emailing the PDF directly
    //    (the doc-gen Lambda never returns PDF bytes and always attaches a real PDF
    //    whenever it emails, so it can't be used for a link-only notification)
    const token = await createReportToken({
      supabaseUrl,
      supabaseKey,
      password,
      reportType: 'hearing_screening_report',
      reportData: documentObject,
      studentId: screening.student_id,
      schoolId: screening.students.school_id,
      createdBy: generated_by,
    })

    const viewUrl = `${Deno.env.get('APP_BASE_URL')}/view-report/${token}`

    const isStaff = studentInfo.grade === 'Staff'

    console.log(`Sending secure report link to ${recipientEmails.join(', ')}...`)

    await sendReportLinkEmail({
      recipients: recipientEmails,
      subject: `NVSS ${isStaff ? 'Staff' : 'Student'} Hearing Report`,
      reportLabel: `${studentInfo.first_name} ${studentInfo.last_name}'s hearing report`,
      viewUrl,
    })

    console.log(`Secure report link sent successfully`)

    // 8. Log the generation in reports table
    const reportInsertUrl = `${supabaseUrl}/rest/v1/reports`
    await fetch(reportInsertUrl, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_id: screening.student_id,
        school_id: screening.students.school_id,
        hearing_screening_id: hearing_screening_id,
        report_type: 'hearing_screening_report',
        file_key: `hearing_report_${hearing_screening_id}`,
        generated_by: generated_by || null,
        metadata: {
          sent_to: recipientEmails,
          template_used: documentObject.template.name,
          school_code: studentInfo.school_code,
          right_ear_result: studentInfo.right_ear_result,
          left_ear_result: studentInfo.left_ear_result,
          delivery_method: 'password_protected_link',
          report_token: token,
        },
      }),
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: `Hearing report generated and a secure link sent to ${recipientEmails.join(', ')}`,
        student_name: `${studentInfo.first_name} ${studentInfo.last_name}`,
        template_used: documentObject.template.name,
        results: {
          right_ear: studentInfo.right_ear_result,
          left_ear: studentInfo.left_ear_result,
        },
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
    console.error('Error generating hearing report:', error)
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

// Student info with every measurement + result field the hearing templates use. Shared
// by the single-student and bundled paths so both build identical reports.
function buildHearingStudentInfo(screening) {
  // School code - hardcoded to NVSS2025 for now
  const schoolCode = 'NVSS2025'

  return {
    first_name: screening.students.first_name,
    last_name: screening.students.last_name,
    grade: screening.school_grades?.grade_level || '',
    email: '',
    date_of_screening: new Date(screening.created_at).toISOString().split('T')[0],
    school: screening.students.schools?.name || '',
    school_code: schoolCode,

    // Raw measurement values
    right_ear_volume_ml: screening.right_volume_db?.toString() || '',
    right_ear_compliance_ml: screening.right_compliance?.toString() || '',
    right_ear_press_dapa: screening.right_pressure?.toString() || '',

    // Right ear result interpretations (NOW PROPERLY MAPPED)
    right_ear_volume_result: screening.right_ear_volume_result || '',
    right_ear_compliance_result: screening.right_ear_compliance_result || '',
    right_ear_press_result: screening.right_ear_pressure_result || '',

    // Raw measurement values for left ear
    left_ear_volume_ml: screening.left_volume_db?.toString() || '',
    left_ear_compliance_ml: screening.left_compliance?.toString() || '',
    left_ear_press_dapa: screening.left_pressure?.toString() || '',

    // Left ear result interpretations (NOW PROPERLY MAPPED)
    left_ear_volume_result: screening.left_ear_volume_result || '',
    left_ear_compliance_result: screening.left_ear_compliance_result || '',
    left_ear_press_result: screening.left_ear_pressure_result || '',

    // Overall ear results - CRITICAL FOR PASS/FAIL LOGIC
    right_ear_result: screening.right_ear_result || '',
    left_ear_result: screening.left_ear_result || '',

    referral_notes: screening.referral_notes || '',
    note: screening.clinical_notes || '',
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Bundled mode: every selected screening's hearing report behind ONE password-protected
// link (shown like a school-wide hearing report), sent in ONE email. Each report is built
// exactly as in single mode - same student info, same createDocumentObject templates.
async function handleBundledHearingReports({
  hearingScreeningIds,
  overrideEmails,
  generatedBy,
  password,
  academicYear,
}) {
  if (!password) {
    throw new Error('password is required')
  }

  const recipientEmails = Array.isArray(overrideEmails) ? overrideEmails.filter(Boolean) : []
  if (recipientEmails.length === 0) {
    throw new Error('override_emails is required when sending hearing reports for multiple students')
  }

  const ids = hearingScreeningIds.filter(id => UUID_RE.test(id))
  if (ids.length === 0) {
    throw new Error('No valid hearing_screening_ids provided')
  }

  console.log(`Processing bundled hearing reports for ${ids.length} hearing screenings`)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
  }

  // 1. Fetch the selected screenings with the same joins as single mode, 50 per request
  const screenings = []
  const batchSize = 50
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    const url = `${supabaseUrl}/rest/v1/hearing_screenings?id=in.(${batch.join(
      ','
    )})&select=*,students(*,schools(*)),school_grades(*)`

    const response = await fetch(url, { headers })
    if (!response.ok) {
      throw new Error(`Failed to fetch selected hearing screenings: ${response.status}`)
    }
    screenings.push(...(await response.json()))
  }

  if (screenings.length === 0) {
    throw new Error('None of the selected hearing screenings were found')
  }

  // Keep the order the user saw in the table (PostgREST returns in.() matches in DB order)
  screenings.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))

  // 2. Build each student's hearing report. One bad screening shouldn't sink the whole
  //    bundle, so failures are skipped and reported back.
  const documents = []
  const skippedStudents = []

  for (const screening of screenings) {
    const studentName = `${screening.students?.first_name} ${screening.students?.last_name}`

    try {
      const studentInfo = buildHearingStudentInfo(screening)
      const documentObject = createDocumentObject(studentInfo)

      // Grade folder, like the school-wide hearing report (Staff gets its own folder)
      documentObject.metadata.directory = studentInfo.grade.replace('/', '-') || 'Ungraded'

      documents.push(documentObject)
    } catch (error) {
      console.error(`Error building hearing report for ${studentName}:`, error)
      skippedStudents.push(studentName)
    }
  }

  if (documents.length === 0) {
    throw new Error('No hearing reports could be generated for the selected hearing screenings')
  }

  // 3. Keep ZIP paths unique. The same student can be selected more than once, and the
  //    ZIP download silently overwrites files that share a path.
  const pathOf = doc => `${doc.metadata.directory}/${doc.metadata.file_name}`
  const allPaths = documents.map(pathOf)
  const duplicatePaths = new Set(allPaths.filter((path, i) => allPaths.indexOf(path) !== i))
  const usedPaths = new Set()

  for (const doc of documents) {
    if (duplicatePaths.has(pathOf(doc))) {
      doc.metadata.file_name += ` (${doc.context.date_of_screening})`
    }

    const baseName = doc.metadata.file_name
    for (let n = 2; usedPaths.has(pathOf(doc)); n++) {
      doc.metadata.file_name = `${baseName} (${n})`
    }

    usedPaths.add(pathOf(doc))
  }

  const schoolId = screenings[0].students?.school_id ?? null
  const fullSchoolName = screenings[0].students?.schools?.name || ''
  const schoolName = fullSchoolName.split('(')[0].trim()

  // 4. One password-protected token for the whole bundle. 'school_wide_hearing_reports'
  //    makes the viewer show it like a school-wide hearing report (grade picker + ZIP).
  const token = await createReportToken({
    supabaseUrl,
    supabaseKey,
    password,
    reportType: 'school_wide_hearing_reports',
    reportData: {
      documents,
      school_name: fullSchoolName,
      academic_year: academicYear ?? null,
    },
    schoolId,
    createdBy: generatedBy,
  })

  const viewUrl = `${Deno.env.get('APP_BASE_URL')}/view-report/${token}`
  const reportsLabel = `${documents.length} selected hearing report${
    documents.length === 1 ? '' : 's'
  }`

  console.log(`Sending secure bundled hearing report link to ${recipientEmails.join(', ')}...`)

  await sendReportLinkEmail({
    recipients: recipientEmails,
    subject: `Hearing Reports - ${schoolName} (${documents.length} selected)`,
    reportLabel: `${reportsLabel} from ${schoolName}`,
    viewUrl,
  })

  console.log(`Secure bundled hearing report link sent successfully`)

  // 5. Log one row for the whole bundle
  await fetch(`${supabaseUrl}/rest/v1/reports`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      school_id: schoolId,
      report_type: 'school_wide_hearing_screenings_report',
      is_bulk: true,
      file_key: `hearing_reports_bulk_${schoolId}_${academicYear ?? 'selected'}`,
      generated_by: generatedBy || null,
      metadata: {
        sent_to: recipientEmails,
        scope: 'selected',
        screening_ids: screenings.map(s => s.id),
        student_count: documents.length,
        skipped_students: skippedStudents,
        academic_year: academicYear ?? null,
        school_name: fullSchoolName,
        includes_summary_report: false,
        delivery_method: 'password_protected_link',
        report_token: token,
      },
    }),
  })

  return new Response(
    JSON.stringify({
      success: true,
      message: `${reportsLabel} generated and a secure link sent to ${recipientEmails.join(', ')}`,
      school_name: fullSchoolName,
      student_count: documents.length,
      skipped_students: skippedStudents,
    }),
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    }
  )
}

function createDocumentObject(studentInfo) {
  // Determine template name based on notes and results (matching Airtable logic)
  let templateName = ''

  // First check for special notes
  if (studentInfo.note === 'Absent') {
    templateName = '(A) Absent'
  } else if (studentInfo.note === 'Non-compliant') {
    templateName = '(NC) Non-compliant'
  } else if (studentInfo.note === 'Complex Needs') {
    templateName = '(CN) Complex Needs'
  } else {
    // Determine pass/fail based on Type A results
    const isStaff = studentInfo.grade === 'Staff'
    const passed =
      studentInfo.right_ear_result.includes('Type A') &&
      studentInfo.left_ear_result.includes('Type A')

    if (isStaff) {
      templateName = passed ? '(P) Pass - Staff' : '(F) Fail - Staff'
    } else {
      templateName = passed ? '(P) Pass' : '(F) Fail'
    }
  }

  return {
    metadata: {
      file_name: `${studentInfo.first_name} ${studentInfo.last_name} - NVSS Student Hearing Report`,
    },
    template: {
      name: `hearing-screen/${templateName}`,
      version: 1,
    },
    context: {
      student_name: `${studentInfo.first_name} ${studentInfo.last_name}`,
      date_of_screening: studentInfo.date_of_screening,
      grade: studentInfo.grade,
      code: studentInfo.school_code,
      // Include all student info if it's a fail template
      ...(templateName.includes('Fail') ? studentInfo : {}),
    },
  }
}
