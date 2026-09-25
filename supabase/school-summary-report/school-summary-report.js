import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { AwsClient } from 'npm:aws4fetch@1'
import { isWithinAcademicYear } from '../_shared/academicYear.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.info('School summary report function started')

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
    const {
      school_id,
      academic_year,
      caseload_scope,
      override_emails,
      report_id,
      generated_by,
      password,
    } = await req.json()

    const caseloadScope = caseload_scope === 'school_year' ? 'school_year' : 'full_caseload'

    if (!school_id) {
      throw new Error('school_id is required')
    }
    if (!academic_year) {
      throw new Error('academic_year is required')
    }
    if (!Array.isArray(override_emails) || override_emails.length === 0) {
      throw new Error('override_emails is required')
    }
    if (!password) {
      throw new Error('password is required')
    }

    console.log(`Processing school summary report for school: ${school_id}, year: ${academic_year}`)

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
    const schoolName = school.name
    const emailSchoolName = schoolName.split('(')[0].trim()

    console.log(`Found school: ${schoolName}`)

    // 2. Get all students for this school
    const studentsUrl = `${supabaseUrl}/rest/v1/students?school_id=eq.${school_id}&select=id,first_name,last_name,program_status,current_grade_id`

    const studentsResponse = await fetch(studentsUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!studentsResponse.ok) {
      throw new Error(`Failed to fetch students: ${studentsResponse.status}`)
    }

    const students = await studentsResponse.json()
    if (!students || students.length === 0) {
      throw new Error('No students found for this school')
    }

    const gradesUrl = `${supabaseUrl}/rest/v1/school_grades?school_id=eq.${school_id}&select=id,grade_level`
    const gradesResponse = await fetch(gradesUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!gradesResponse.ok) {
      throw new Error(`Failed to fetch school grades: ${gradesResponse.status}`)
    }

    const schoolGrades = await gradesResponse.json()
    const gradeLevelById = new Map(schoolGrades.map(grade => [grade.id, grade.grade_level]))

    const studentIds = students.map(student => student.id)
    console.log(`Found ${studentIds.length} students for school`)

    // 3. Get screenings for these students using batch processing
    const allScreenings = []
    const batchSize = 50

    console.log(`Processing ${studentIds.length} students in batches of ${batchSize}...`)

    for (let i = 0; i < studentIds.length; i += batchSize) {
      const batch = studentIds.slice(i, i + batchSize)
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          studentIds.length / batchSize
        )}: ${batch.length} students`
      )

      const screeningsUrl = `${supabaseUrl}/rest/v1/speech_screenings?student_id=in.(${batch.join(
        ','
      )})&select=*,students(*),school_grades(*)`

      const screeningsResponse = await fetch(screeningsUrl, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!screeningsResponse.ok) {
        console.error(
          `Failed to fetch speech screenings for batch starting at index ${i}: ${screeningsResponse.status}`
        )
        throw new Error(`Failed to fetch speech screenings: ${screeningsResponse.status}`)
      }

      const batchScreenings = await screeningsResponse.json()
      if (batchScreenings && batchScreenings.length > 0) {
        allScreenings.push(...batchScreenings)
      }

      // Add a small delay between batches to avoid overwhelming the database
      if (i + batchSize < studentIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`Found ${allScreenings.length} total screenings for school`)

    // 4. Filter by academic year
    const filteredScreenings = allScreenings.filter(screening =>
      isWithinAcademicYear(screening.created_at, academic_year)
    )

    console.log(
      `Found ${filteredScreenings.length} screenings within academic year ${academic_year}`
    )

    // 5. Get the latest screening for each student
    const latestScreenings = getLatestScreeningsPerStudent(filteredScreenings)
    console.log(`Processing ${latestScreenings.length} unique students`)

    // 6. Transform records for the report
    const transformRecord = screening => ({
      name: `${screening.students.first_name} ${screening.students.last_name}`,
      grade: screening.school_grades?.grade_level || '',
      result: screening.result || '',
      date: new Date(screening.created_at).toISOString().split('T')[0],
      recommendations_and_referrals: screening.referral_notes || '',
    })

    // 7. Helper function to check if student qualifies for speech program
    const isQualifiedStudent = screening => {
      if (!screening.error_patterns) return false

      let patterns = screening.error_patterns
      if (typeof screening.error_patterns === 'string') {
        try {
          patterns = JSON.parse(screening.error_patterns)
        } catch (e) {
          console.error('Failed to parse error_patterns JSON for qualification check:', e)
          return false
        }
      }

      return (
        patterns?.screening_metadata?.qualifies_for_speech_program === true ||
        patterns?.screening_metadata?.qualifies_for_speech_program === 'true'
      )
    }

    // 8. Helper function to check if student is a sub student
    const isSubStudent = screening => {
      if (!screening.error_patterns) return false

      let patterns = screening.error_patterns
      if (typeof screening.error_patterns === 'string') {
        try {
          patterns = JSON.parse(screening.error_patterns)
        } catch (e) {
          console.error('Failed to parse error_patterns JSON for sub check:', e)
          return false
        }
      }

      return (
        patterns?.screening_metadata?.sub === true || patterns?.screening_metadata?.sub === 'true'
      )
    }

    // 9. Separate students into qualified and sub categories. "school_year" only looks at screenings dated within the selected academic year (original behavior). "full_caseload" instead reads every student's current program_status directly, so a student who qualified in a prior year with no rescreen since still shows as currently eligible.
    let qualifiedStudents
    let subStudents

    if (caseloadScope === 'full_caseload') {
      // Latest screening per student across ALL years, so a later "No Consent" attempt
      // overrides a stale qualified/sub program_status - such students shouldn't be on
      // caseload at all, even though their record still says qualified/sub.
      const latestScreeningByStudentId = new Map()
      allScreenings.forEach(screening => {
        const existing = latestScreeningByStudentId.get(screening.student_id)
        if (!existing || new Date(screening.created_at) > new Date(existing.created_at)) {
          latestScreeningByStudentId.set(screening.student_id, screening)
        }
      })
      const hasNoConsent = student =>
        latestScreeningByStudentId.get(student.id)?.result === 'non_registered_no_consent'

      qualifiedStudents = students.filter(
        student => student.program_status === 'qualified' && !hasNoConsent(student)
      )
      subStudents = students.filter(
        student => student.program_status === 'sub' && !hasNoConsent(student)
      )
    } else {
      qualifiedStudents = latestScreenings.filter(
        screening => isQualifiedStudent(screening) && !isSubStudent(screening)
      )
      subStudents = latestScreenings.filter(isSubStudent)
    }

    const priorityRescreenStudents = latestScreenings.filter(
      screening => screening.students?.needs_priority_rescreen === true
    )

    const studentsRecommendationsAndReferrals = latestScreenings.filter(screening => {
      const referralNotes = screening.referral_notes || ''
      return referralNotes.trim() !== ''
    })

    console.log(
      `Found ${qualifiedStudents.length} qualified students and ${subStudents.length} sub students`
    )
    console.log(`Found ${priorityRescreenStudents.length} students flagged for priority rescreen`)
    console.log(`Found ${studentsRecommendationsAndReferrals.length} students with recommendations`)

    // 9b. Get returning-absent students (qualified/sub last year, absent or not yet
    //     screened this year). Only meaningful when this report's academic_year IS
    //     the year currently in progress, since the RPC always compares against "now" -
    //     showing it against a past academic_year would be comparing the wrong years.
    const isReportForCurrentYear = isWithinAcademicYear(new Date().toISOString(), academic_year)
    let returningAbsentStudents = []

    if (isReportForCurrentYear) {
      const returningAbsentResponse = await fetch(
        `${supabaseUrl}/rest/v1/rpc/get_returning_absent_students`,
        {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ p_school_id: school_id }),
        }
      )

      if (!returningAbsentResponse.ok) {
        throw new Error(
          `Failed to fetch returning absent students: ${returningAbsentResponse.status}`
        )
      }

      const returningAbsentRows = await returningAbsentResponse.json()
      const studentById = new Map(students.map(student => [student.id, student]))

      returningAbsentStudents = returningAbsentRows.map(row => {
        const student = studentById.get(row.student_id)
        return {
          name: `${row.first_name} ${row.last_name}`,
          grade: student ? gradeLevelById.get(student.current_grade_id) || '' : '',
        }
      })
    }

    console.log(`Found ${returningAbsentStudents.length} returning-absent students`)

    // 10. Determine which template to use based on whether there are recommendations
    const hasRecommendations = studentsRecommendationsAndReferrals.length > 0
    const templateName = hasRecommendations
      ? 'Schools Summary Report With Referrals'
      : 'Schools Summary Report No Referrals'

    console.log(`Using template: ${templateName}`)

    // Section A needs a different transform depending on scope: "school_year" entries are screenings (use the existing transformRecord), "full_caseload" entries are raw student records with no associated screening, so grade comes from gradeLevelById instead.
    const toSummaryStudent = student => ({
      name: `${student.first_name} ${student.last_name}`,
      grade: gradeLevelById.get(student.current_grade_id) || '',
    })

    const transformSectionA = caseloadScope === 'full_caseload' ? toSummaryStudent : transformRecord

    // 11. Build the document object (this becomes the report_data behind the password gate)
    const documentObject = {
      metadata: {
        file_name: `${schoolName}-Summary`,
      },
      template: {
        name: templateName,
        version: 1,
      },
      context: {
        screening_date: academic_year,
        slp: 'Lisa Brillinger',
        qualified: qualifiedStudents.length > 0,
        qualified_students: qualifiedStudents.map(transformSectionA),
        sub: subStudents.length > 0,
        sub_students: subStudents.map(transformSectionA),
        priority_rescreen: priorityRescreenStudents.length > 0,
        students_priority_rescreen: priorityRescreenStudents.map(transformRecord),
        students_recommendations_and_referrals:
          studentsRecommendationsAndReferrals.map(transformRecord),
        returning_absent: returningAbsentStudents.length > 0,
        returning_absent_students: returningAbsentStudents,
      },
    }

    // 12. Create a password-protected report token instead of emailing the PDF directly
    //    (the doc-gen Lambda never returns PDF bytes and always attaches a real PDF
    //    whenever it emails, so it can't be used for a link-only notification)
    const token = await createReportToken({
      supabaseUrl,
      supabaseKey,
      password,
      reportType: 'school_summary_report',
      reportData: {
        documents: [documentObject],
        school_name: schoolName,
        academic_year,
        record_id: report_id ?? null,
      },
      schoolId: school_id,
      createdBy: generated_by,
    })

    const viewUrl = `${Deno.env.get('APP_BASE_URL')}/view-report/${token}`

    console.log(`Sending secure report link to ${override_emails.join(', ')}...`)

    await sendReportLinkEmail({
      recipients: override_emails,
      subject: `${emailSchoolName}: NVSS Speech Screen Summary Report`,
      reportLabel: `${emailSchoolName}'s speech screen summary report for ${academic_year}`,
      viewUrl,
    })

    console.log(`Secure report link sent successfully`)

    // Log the generation in reports table
    await fetch(`${supabaseUrl}/rest/v1/reports`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        school_id: school_id,
        report_type: 'school_wide_speech_summary_report',
        is_bulk: true,
        file_key: `school_summary_${school_id}_${academic_year}`,
        generated_by: generated_by || null,
        metadata: {
          sent_to: override_emails,
          academic_year: academic_year,
          delivery_method: 'password_protected_link',
          report_token: token,
        },
      }),
    })

    // 14. Update report status if report_id provided
    if (report_id) {
      const reportUpdateUrl = `${supabaseUrl}/rest/v1/school_reports_history?id=eq.${report_id}`
      await fetch(reportUpdateUrl, {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'sent',
          form_type: 'School Summary Report',
          sent_at: new Date().toISOString(),
        }),
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `School summary report generated and a secure link sent to ${override_emails.join(', ')}`,
        school_name: schoolName,
        qualified_students: qualifiedStudents.length,
        sub_students: subStudents.length,
        students_with_recommendations: studentsRecommendationsAndReferrals.length,
        academic_year: academic_year,
        template_used: templateName,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error generating school summary report:', error)

    // Update report status to failed if report_id provided
    if (error.report_id) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        const reportUpdateUrl = `${supabaseUrl}/rest/v1/school_reports_history?id=eq.${error.report_id}`
        await fetch(reportUpdateUrl, {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'failed',
            form_type: 'School Summary Report',
          }),
        })
      } catch (updateError) {
        console.error('Error updating failed status:', updateError)
      }
    }

    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Helper function to get latest screening per student
function getLatestScreeningsPerStudent(screenings) {
  const latestScreenings = {}

  screenings.forEach(screening => {
    const key = `${screening.students.first_name}-${screening.students.last_name}-${screening.students.school_id}`
    const currentDate = new Date(screening.created_at)

    if (!latestScreenings[key] || currentDate > new Date(latestScreenings[key].created_at)) {
      latestScreenings[key] = screening
    }
  })

  return Object.values(latestScreenings)
}
