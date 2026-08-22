// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { AwsClient } from 'npm:aws4fetch@1'
import { getAcademicYearRange } from '../_shared/academicYear.ts'

const GRADE_MAPPING = [
  { display: 'Headstart', value: 'Headstart' },
  { display: 'Nursery', value: 'Nursery' },
  { display: 'Pre-K', value: 'Pre-K' },
  { display: 'K4', value: 'K4' },
  { display: 'K5', value: 'K5' },
  { display: 'Kindergarten', value: 'Kindergarten' },
  { display: 'K/1', value: 'K/1' },
  { display: '1', value: '1' },
  { display: '1/2', value: '1/2' },
  { display: '2', value: '2' },
  { display: '2/3', value: '2/3' },
  { display: '3', value: '3' },
  { display: '3/4', value: '3/4' },
  { display: '4', value: '4' },
  { display: '4/5', value: '4/5' },
  { display: '5', value: '5' },
  { display: '5/6', value: '5/6' },
  { display: '6', value: '6' },
  { display: '6/7', value: '6/7' },
  { display: '7', value: '7' },
  { display: '7/8', value: '7/8' },
  { display: '8', value: '8' },
  { display: '8/9', value: '8/9' },
  { display: '9', value: '9' },
  { display: '9/10', value: '9/10' },
  { display: '10', value: '10' },
  { display: '10/11', value: '10/11' },
  { display: '11', value: '11' },
  { display: '11/12', value: '11/12' },
  { display: '12', value: '12' },
]

// For hearing reports: same order as above with Staff last
const HEARING_GRADE_MAPPING = [...GRADE_MAPPING, { display: 'Staff', value: 'Staff' }]

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.info('School-wide hearing report function started')

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
    const { school_id, academic_year, override_emails, generated_by, password } = await req.json()

    if (!school_id) {
      throw new Error('school_id is required')
    }

    if (!academic_year) {
      throw new Error('academic_year is required (format: YYYY-YYYY, e.g., 2024-2025)')
    }

    if (!password) {
      throw new Error('password is required')
    }

    console.log(
      `Processing school-wide hearing reports for school: ${school_id}, year: ${academic_year}`,
    )

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // 1. Get school information
    const schoolUrl = `${supabaseUrl}/rest/v1/schools?id=eq.${school_id}&select=*`
    const schoolResponse = await fetch(schoolUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!schoolResponse.ok) {
      throw new Error(`Failed to fetch school: ${schoolResponse.status}`)
    }

    const schools = await schoolResponse.json()
    if (!schools || schools.length === 0) {
      throw new Error('School not found')
    }

    const school = schools[0]
    console.log(`Found school: ${school.name}`)

    // 2. Determine academic year date range
    const { start: academicYearStart, end: academicYearEnd } = getAcademicYearRange(academic_year)

    // 3. Get all hearing screenings for this school and academic year
    const screeningsUrl = `${supabaseUrl}/rest/v1/hearing_screenings?select=*,students!inner(*,current_grade:current_grade_id(*)),school_grades!grade_id(*)&students.school_id=eq.${school_id}&created_at=gte.${academicYearStart.toISOString()}&created_at=lte.${academicYearEnd.toISOString()}&order=created_at.desc`

    const screeningsResponse = await fetch(screeningsUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!screeningsResponse.ok) {
      throw new Error(`Failed to fetch hearing screenings: ${screeningsResponse.status}`)
    }

    const allScreenings = await screeningsResponse.json()

    if (!allScreenings || allScreenings.length === 0) {
      throw new Error('No hearing screenings found for this school and academic year')
    }

    console.log(`Found ${allScreenings.length} total screenings`)

    // 4. Get only the latest screening for each student
    const latestScreenings = new Map()

    allScreenings.forEach(screening => {
      const studentId = screening.student_id
      const existingScreening = latestScreenings.get(studentId)

      if (
        !existingScreening ||
        new Date(screening.created_at) > new Date(existingScreening.created_at)
      ) {
        latestScreenings.set(studentId, screening)
      }
    })

    const screeningsToProcess = Array.from(latestScreenings.values())
    console.log(`Processing ${screeningsToProcess.length} students (latest screenings only)`)

    // 5. Get school code - hardcoded to NVSS2025 for now (you may want to add this to schools table)
    const schoolCode = 'NVSS2025'

    // 6. Create document objects for each student
    const studentDocuments = screeningsToProcess.map(screening => {
      const studentInfo = extractStudentInfo(screening, schoolCode, academic_year)
      return createDocumentObject(studentInfo)
    })

    // Sort by grade (HEARING_GRADE_MAPPING order; Staff last for hearing)
    const gradeOrderForSort = HEARING_GRADE_MAPPING.map(g => g.value)
    studentDocuments.sort((a, b) => {
      const gradeA = a.context.grade || ''
      const gradeB = b.context.grade || ''

      const indexA = gradeOrderForSort.indexOf(gradeA)
      const indexB = gradeOrderForSort.indexOf(gradeB)

      if (indexA !== -1 && indexB !== -1) return indexA - indexB
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1
      return gradeA.localeCompare(gradeB)
    })

    // 6b. Find referred students and create summary document
    const referredStudents = screeningsToProcess.filter(isReferredStudent)
    console.log(`Found ${referredStudents.length} referred students for summary report`)

    const summaryDocument = createSummaryDocument(school.name, academic_year, referredStudents)

    // Combine summary document with student documents
    const documentObjects = [summaryDocument, ...studentDocuments]

    // 7. Create email config
    const recipientEmails =
      Array.isArray(override_emails) && override_emails.length > 0
        ? override_emails
        : school.principal_email
          ? [school.principal_email]
          : []

    if (recipientEmails.length === 0) {
      throw new Error(
        'No email address available. Please provide override_emails or ensure school has principal_email set.',
      )
    }

    const emailSchoolName = school.name.split('(')[0].trim()

    console.log(`Sending ${documentObjects.length} reports for a secure link...`)
    console.log(`Email will be sent to: ${recipientEmails.join(', ')}`)

    // 8. Create a password-protected report token instead of emailing the PDFs directly
    //    (the doc-gen Lambda never returns PDF bytes and always attaches a real PDF
    //    whenever it emails, so it can't be used for a link-only notification)
    const token = await createReportToken({
      supabaseUrl,
      supabaseKey,
      password,
      reportType: 'school_wide_hearing_reports',
      reportData: {
        documents: documentObjects,
        school_name: school.name,
        academic_year,
      },
      schoolId: school_id,
      createdBy: generated_by,
    })

    const viewUrl = `${Deno.env.get('APP_BASE_URL')}/view-report/${token}`

    console.log(`Sending secure report link to ${recipientEmails.join(', ')}...`)

    await sendReportLinkEmail({
      recipients: recipientEmails,
      subject: `${emailSchoolName}: NVSS Student Reports`,
      reportLabel: `${emailSchoolName}'s student hearing reports for ${academic_year}`,
      viewUrl,
    })

    console.log(`Secure report link sent successfully`)

    // 9. Log the bulk generation in reports table
    const reportInsertUrl = `${supabaseUrl}/rest/v1/reports`
    await fetch(reportInsertUrl, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        school_id: school_id,
        report_type: 'school_wide_hearing_screenings_report',
        is_bulk: true,
        file_key: `hearing_reports_bulk_${school_id}_${academic_year}`,
        generated_by: generated_by || null,
        metadata: {
          sent_to: recipientEmails,
          academic_year,
          student_count: studentDocuments.length,
          referred_count: referredStudents.length,
          school_name: school.name,
          school_code: schoolCode,
          includes_summary_report: true,
          delivery_method: 'password_protected_link',
          report_token: token,
        },
      }),
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: `School-wide hearing reports generated and a secure link sent to ${recipientEmails.join(', ')}`,
        school_name: school.name,
        academic_year,
        student_count: studentDocuments.length,
        referred_count: referredStudents.length,
        summary: {
          total_students: studentDocuments.length,
          referred_students: referredStudents.length,
          templates_used: getTemplateSummary(studentDocuments),
          includes_summary_report: true,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error generating school-wide hearing reports:', error)
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
      },
    )
  }
})

function extractStudentInfo(screening, schoolCode, academicYear) {
  const gradeLevel =
    screening.school_grades?.grade_level || screening.students?.current_grade?.grade_level || ''

  return {
    first_name: screening.students.first_name,
    last_name: screening.students.last_name,
    grade: gradeLevel,
    email: '', // Not used in school-wide reports
    date_of_screening: new Date(screening.created_at).toISOString().split('T')[0],
    school: screening.students.schools?.name || '',
    school_code: schoolCode,

    // Raw measurement values
    right_ear_volume_ml: screening.right_volume_db?.toString() || '',
    right_ear_compliance_ml: screening.right_compliance?.toString() || '',
    right_ear_press_dapa: screening.right_pressure?.toString() || '',

    // Right ear result interpretations
    right_ear_volume_result: screening.right_ear_volume_result || '',
    right_ear_compliance_result: screening.right_ear_compliance_result || '',
    right_ear_press_result: screening.right_ear_pressure_result || '',

    // Raw measurement values for left ear
    left_ear_volume_ml: screening.left_volume_db?.toString() || '',
    left_ear_compliance_ml: screening.left_compliance?.toString() || '',
    left_ear_press_dapa: screening.left_pressure?.toString() || '',

    // Left ear result interpretations
    left_ear_volume_result: screening.left_ear_volume_result || '',
    left_ear_compliance_result: screening.left_ear_compliance_result || '',
    left_ear_press_result: screening.left_ear_pressure_result || '',

    // Overall ear results - CRITICAL FOR PASS/FAIL LOGIC
    right_ear_result: screening.right_ear_result || '',
    left_ear_result: screening.left_ear_result || '',

    // Result field for absent check
    result: screening.result || '',
    referral_notes: screening.referral_notes || '',
    note: screening.clinical_notes || '',
  }
}

function createDocumentObject(studentInfo) {
  // Determine template name based on notes and results (matching Airtable logic)
  let templateName = ''

  // Define passing types (Type A, AS, AD)
  const passingTypes = ['Type A', 'Type AS', 'Type AD']

  // First check the result field for absent
  const resultField = (studentInfo.result || '').toLowerCase()

  if (resultField === 'absent') {
    templateName = '(A) Absent'
  } else if (studentInfo.note === 'Non-compliant') {
    templateName = '(NC) Non-compliant'
  } else if (studentInfo.note === 'Complex Needs') {
    templateName = '(CN) Complex Needs'
  } else {
    // Determine pass/fail based on passing types (Type A, AS, AD)
    const isStaff = studentInfo.grade === 'Staff'
    const passedRightEar = passingTypes.some(type => studentInfo.right_ear_result.includes(type))
    const passedLeftEar = passingTypes.some(type => studentInfo.left_ear_result.includes(type))
    const passed = passedRightEar && passedLeftEar

    if (isStaff) {
      templateName = passed ? '(P) Pass - Staff' : '(F) Fail - Staff'
    } else {
      templateName = passed ? '(P) Pass' : '(F) Fail'
    }
  }

  return {
    metadata: {
      file_name: `${studentInfo.first_name} ${studentInfo.last_name} - NVSS Student Hearing Report`,
      directory: studentInfo.grade.replace('/', '-'), // Organize by grade
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

function getTemplateSummary(documentObjects) {
  const summary = {}

  documentObjects.forEach(doc => {
    const templateName = doc.template.name
    summary[templateName] = (summary[templateName] || 0) + 1
  })

  return summary
}

function isReferredStudent(screening) {
  // Define passing types
  const passingTypes = ['Type A', 'Type AS', 'Type AD']

  const rightEarResult = screening.right_ear_result || ''
  const leftEarResult = screening.left_ear_result || ''

  // Check if each ear has one of the passing types
  const passedRightEar = passingTypes.some(type => rightEarResult.includes(type))
  const passedLeftEar = passingTypes.some(type => leftEarResult.includes(type))

  // Exclude absent students from referral
  const isAbsent = (screening.result || '').toLowerCase() === 'absent'

  // Referred if either ear doesn't have a passing type, and not absent
  return (!passedRightEar || !passedLeftEar) && !isAbsent
}

function createSummaryDocument(schoolName, academicYear, referredStudents) {
  const transformRecord = screening => ({
    name: `${screening.students.first_name} ${screening.students.last_name}`,
    grade:
      screening.school_grades?.grade_level || screening.students?.current_grade?.grade_level || '',
  })

  return {
    metadata: {
      file_name: `${schoolName}-Hearing-Summary`,
      directory: 'School Summary Hearing Report', // Put summary at the top level
    },
    template: {
      name: 'School Summary Hearing Report',
      version: 1,
    },
    context: {
      screening_date: academicYear,
      referred: referredStudents.length > 0,
      referred_students: referredStudents.map(transformRecord),
    },
  }
}
