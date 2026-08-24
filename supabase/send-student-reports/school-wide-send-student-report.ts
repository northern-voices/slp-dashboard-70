// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { AwsClient } from 'npm:aws4fetch@1'
import { isWithinAcademicYear } from '../_shared/academicYear.ts'

interface StudentInfo {
  first_name: string
  last_name: string
  grade: string
  date: string
  school: string
  school_code: string
  speech_screen_result: string
}

interface ProcessedError {
  sound: string
  pattern: string
  example: string
  targetSound: string
  week?: number
}

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
] as const

// For hearing reports: same order as above with Staff last
const HEARING_GRADE_MAPPING = [...GRADE_MAPPING, { display: 'Staff', value: 'Staff' }]

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.info('School reports function started')

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
  const accessKeyId = Deno.env.get('AWS_SES_ACCESS_KEY_ID')!
  const secretAccessKey = Deno.env.get('AWS_SES_SECRET_ACCESS_KEY')!
  const region = Deno.env.get('AWS_SES_REGION')!
  const senderEmail = Deno.env.get('REPORT_SENDER_EMAIL')!

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

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { school_id, academic_year, override_emails, report_id, generated_by, password } =
      await req.json()

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

    console.log(`Processing school reports for school: ${school_id}, year: ${academic_year}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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
    const schoolName = school.name.split('(')[0].trim()
    const schoolCode = school.code || 'NVSS2025'

    console.log(`Found school: ${school.name}`)

    // 2. Get all speech screenings for the school within the academic year
    // First get all students for this school
    const studentsUrl = `${supabaseUrl}/rest/v1/students?school_id=eq.${school_id}&select=id`
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

    const studentIds = students.map((student: any) => student.id)
    console.log(`Found ${studentIds.length} students for school`)

    // Now get screenings for these students using batch processing
    const allScreenings = []
    const batchSize = 50 // Process 50 students at a time

    console.log(`Processing ${studentIds.length} students in batches of ${batchSize}...`)

    for (let i = 0; i < studentIds.length; i += batchSize) {
      const batch = studentIds.slice(i, i + batchSize)
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          studentIds.length / batchSize,
        )}: ${batch.length} students`,
      )

      const screeningsUrl = `${supabaseUrl}/rest/v1/speech_screenings?student_id=in.(${batch.join(
        ',',
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
          `Failed to fetch speech screenings for batch starting at index ${i}: ${screeningsResponse.status}`,
        )
        throw new Error(`Failed to fetch speech screenings: ${screeningsResponse.status}`)
      }

      const batchScreenings = await screeningsResponse.json()
      if (batchScreenings && batchScreenings.length > 0) {
        allScreenings.push(...batchScreenings)
      }

      // Add a small delay between batches
      if (i + batchSize < studentIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`Found ${allScreenings.length} total screenings for school`)

    // 3. Filter by academic year
    const filteredScreenings = allScreenings.filter((screening: any) =>
      isWithinAcademicYear(screening.created_at, academic_year),
    )

    console.log(
      `Found ${filteredScreenings.length} screenings within academic year ${academic_year}`,
    )

    if (filteredScreenings.length === 0) {
      throw new Error('No screenings found for the specified school and academic year')
    }

    // 4. Get the latest screening for each student
    const latestScreenings = getLatestScreeningsPerStudent(filteredScreenings)
    console.log(`Processing ${latestScreenings.length} unique students`)

    // 5. Process all student records to create document objects
    const documentObjects: any[] = []

    for (const screening of latestScreenings) {
      try {
        const errors = processErrorPatterns(screening.error_patterns || {})

        const studentInfo: StudentInfo = {
          first_name: screening.students.first_name,
          last_name: screening.students.last_name,
          grade: screening.school_grades?.grade_level || '',
          date: new Date(screening.created_at).toISOString().split('T')[0],
          school: schoolName,
          school_code: schoolCode,
          speech_screen_result: screening.result?.replace('/', ':') || '',
        }

        const documentObject = createDocumentObject(studentInfo, errors, screening)
        documentObjects.push(documentObject)
      } catch (error) {
        console.error(
          `Error processing student ${screening.students.first_name} ${screening.students.last_name}:`,
          error,
        )
        // Continue processing other students even if one fails
      }
    }

    if (documentObjects.length === 0) {
      throw new Error('No valid student reports could be generated')
    }

    // 6. Sort document objects by grade (HEARING_GRADE_MAPPING order; Staff last for hearing)
    const gradeOrderForSort = HEARING_GRADE_MAPPING.map(g => g.value)
    documentObjects.sort((a, b) => {
      const gradeA = a.context.grade || ''
      const gradeB = b.context.grade || ''

      const indexA = gradeOrderForSort.indexOf(gradeA)
      const indexB = gradeOrderForSort.indexOf(gradeB)

      // If both grades are in the predefined order, sort by index
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB
      }

      // If only one is in the predefined order, prioritize it
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1

      // If neither is in the predefined order, sort alphabetically
      return gradeA.localeCompare(gradeB)
    })

    // 7. Set directory structure based on grade for proper organization in the zip
    documentObjects.forEach(doc => {
      // Use grade as directory name, replacing any problematic characters
      doc.metadata.directory = doc.context.grade.replace('/', '-') || 'Ungraded'
    })

    // 8. Create a password-protected report token instead of emailing the PDFs directly
    //    (the doc-gen Lambda never returns PDF bytes and always attaches a real PDF
    //    whenever it emails, so it can't be used for a link-only notification)
    const token = await createReportToken({
      supabaseUrl,
      supabaseKey,
      password,
      reportType: 'school_wide_speech_screening_reports',
      reportData: {
        documents: documentObjects,
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
      subject: `${schoolName} - Student Reports - ${academic_year}`,
      reportLabel: `${schoolName}'s student reports for ${academic_year}`,
      viewUrl,
    })

    console.log(`Secure report link sent successfully`)

    // 10. Update report status if report_id provided
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
          form_type: 'School Reports (class wide)',
          sent_at: new Date().toISOString(),
        }),
      })
    }

    // 11. Log the generation in reports table
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
        report_type: 'school_wide_speech_screening_reports',
        file_key: `school_reports_${school_id}_${academic_year}`,
        generated_by: generated_by || null,
        metadata: {
          sent_to: override_emails,
          students_count: documentObjects.length,
          academic_year: academic_year,
          school_name: schoolName,
          school_code: schoolCode,
          delivery_method: 'password_protected_link',
          report_token: token,
        },
      }),
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: `All ${documentObjects.length} school reports generated and a secure link sent to ${override_emails.join(', ')}`,
        school_name: schoolName,
        students_count: documentObjects.length,
        academic_year: academic_year,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error generating school reports:', error)

    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Helper function to get latest screening per student
function getLatestScreeningsPerStudent(screenings: any[]): any[] {
  const latestScreenings: Record<string, any> = {}

  screenings.forEach(screening => {
    const key = `${screening.students.first_name}-${screening.students.last_name}-${screening.students.school_id}`
    const currentDate = new Date(screening.created_at)

    if (!latestScreenings[key] || currentDate > new Date(latestScreenings[key].created_at)) {
      latestScreenings[key] = screening
    }
  })

  return Object.values(latestScreenings)
}

// Helper function to process error patterns from JSONB
function processErrorPatterns(errorPatterns: any): ProcessedError[] {
  if (!errorPatterns || typeof errorPatterns !== 'object') {
    return []
  }

  let patterns = errorPatterns
  if (typeof errorPatterns === 'string') {
    try {
      patterns = JSON.parse(errorPatterns)
    } catch (e) {
      console.error('Failed to parse error_patterns JSON:', e)
      return []
    }
  }

  const processedErrors: ProcessedError[] = []
  const soundErrors = patterns?.articulation?.soundErrors || []

  if (!Array.isArray(soundErrors)) {
    console.warn('soundErrors is not an array:', soundErrors)
    return []
  }

  // Get the comprehensive error patterns lookup
  const errorPatternsLookup = getErrorPatternsLookup()

  // Process each sound error from your actual JSONB structure
  for (const soundError of soundErrors) {
    if (!soundError || typeof soundError !== 'object') {
      continue
    }

    const sound = soundError.sound || 'Unknown'
    const errorPatterns = (soundError.errorPatterns || []).filter(
      (p: string) => p !== 'Stimulability',
    )
    const otherNotes = soundError.otherNotes?.toLowerCase() || ''
    const stoppingSounds = soundError.stoppingSounds || []

    // Skip sounds with no error patterns - they shouldn't be included as errors
    if (!Array.isArray(errorPatterns) || errorPatterns.length === 0) {
      continue
    }

    // Handle multiple error patterns for the same sound
    if (Array.isArray(errorPatterns) && errorPatterns.length > 0) {
      // Check if we have multiple error patterns that should be combined
      if (errorPatterns.length > 1) {
        // Try to find a combined pattern in the lookup table
        const normalizedPatterns = errorPatterns.map(
          p =>
            p
              .replace(/\(Omits/g, '(omits')
              .replace(/\u201C/g, '') // Remove left smart quote
              .replace(/\u201D/g, '') // Remove right smart quote
              .replace(/"/g, '') // Remove straight quotes
              .replace(/'/g, ''), // Remove single quotes
        )
        const combinedKey = normalizedPatterns.join(' and ')
        let errorInfo = errorPatternsLookup[sound]?.[combinedKey]

        // If not found, try reverse order
        if (!errorInfo && normalizedPatterns.length === 2) {
          const reversedKey = normalizedPatterns.reverse().join(' and ')
          errorInfo = errorPatternsLookup[sound]?.[reversedKey]
        }

        if (errorInfo) {
          // Found combined pattern in lookup table
          processedErrors.push({
            sound: sound,
            pattern: errorInfo.pattern,
            example: otherNotes?.toLowerCase() || errorInfo.example,
            targetSound: sound,
          })
        } else {
          // No combined pattern found, process each pattern individually
          for (const pattern of errorPatterns) {
            if (pattern === 'Other') {
              processedErrors.push({
                sound: sound,
                pattern: `Atypical Substitution`,
                example: otherNotes?.toLowerCase() || 'Error detected',
                targetSound: sound,
              })
            } else if (pattern === 'Stopping' && stoppingSounds.length > 0) {
              const stoppingSound = stoppingSounds[0]
              const stoppingKey = `Stopping ${stoppingSound}`
              let errorInfo =
                errorPatternsLookup[sound]?.[stoppingKey] || errorPatternsLookup[sound]?.[pattern]

              processedErrors.push({
                sound: sound,
                pattern: errorInfo?.pattern || pattern,
                example: otherNotes?.toLowerCase() || errorInfo?.example || 'Error detected',
                targetSound: sound,
              })
            } else {
              const normalizedPattern = pattern
                .replace(/\(Omits/g, '(omits')
                .replace(/\u201C/g, '')
                .replace(/\u201D/g, '')
                .replace(/"/g, '')
                .replace(/'/g, '')

              const individualErrorInfo = errorPatternsLookup[sound]?.[normalizedPattern]

              processedErrors.push({
                sound: sound,
                pattern: individualErrorInfo?.pattern || pattern,
                example:
                  otherNotes?.toLowerCase() || individualErrorInfo?.example || 'Error detected',
                targetSound: sound,
              })
            }
          }
        }
      } else {
        // Single error pattern
        const pattern = errorPatterns[0]

        if (pattern === 'Other') {
          processedErrors.push({
            sound: sound,
            pattern: `Atypical Substitution`,
            example: otherNotes?.toLowerCase() || 'Error detected',
            targetSound: sound,
          })
        } else if (pattern === 'Stopping' && stoppingSounds.length > 0) {
          const stoppingSound = stoppingSounds[0]
          const stoppingKey = `Stopping ${stoppingSound}`
          let errorInfo =
            errorPatternsLookup[sound]?.[stoppingKey] || errorPatternsLookup[sound]?.[pattern]

          processedErrors.push({
            sound: sound,
            pattern: errorInfo?.pattern || pattern,
            example: otherNotes?.toLowerCase() || errorInfo?.example || 'Error detected',
            targetSound: sound,
          })
        } else {
          let errorInfo = errorPatternsLookup[sound]?.[pattern]

          if (!errorInfo) {
            const normalizedPattern = pattern
              .replace(/\(Omits/g, '(omits')
              .replace(/\u201C/g, '')
              .replace(/\u201D/g, '')
              .replace(/"/g, '')
              .replace(/'/g, '')
              .replace(/\\/g, '')

            errorInfo = errorPatternsLookup[sound]?.[normalizedPattern]
          }

          processedErrors.push({
            sound: sound,
            pattern: errorInfo?.pattern || pattern,
            example: otherNotes?.toLowerCase() || errorInfo?.example || 'Error detected',
            targetSound: sound,
          })
        }
      }
    } else {
      // Fallback if no errorPatterns
      processedErrors.push({
        sound: sound,
        pattern: 'Error detected',
        example: otherNotes?.toLowerCase() || 'Error detected',
        targetSound: sound,
      })
    }
  }

  return sortPhonologicalProcesses(processedErrors)
}

function sortPhonologicalProcesses(errors: ProcessedError[]): ProcessedError[] {
  const soundOrder = [
    '2 syllables',
    '3 syllables',
    'P',
    'B',
    'M',
    'W',
    'Final P',
    'Final T',
    'Final K',
    'Sp-',
    'St-',
    'Sm-',
    'Sn-',
    'Sk-',
    'K',
    'G',
    'T',
    'D',
    'Final -ts',
    'Final -ps',
    'Final -ks',
    'L',
    'R',
    'S',
    'Z',
    'F',
    'V',
    'Sh',
    'Ch',
    'J',
    '-er',
    '-ar',
    '-or',
    'th',
  ]

  const frontingSoundOrder = [
    '2 syllables',
    '3 syllables',
    'P',
    'B',
    'M',
    'W',
    'Final P',
    'Final T',
    'Sp-',
    'St-',
    'Sm-',
    'Sn-',
    'Final K',
    'K',
    'G',
    'Final -ts',
    'Final -ps',
    'L',
    'R',
    'S',
    'Z',
    'F',
    'V',
    'Sh',
    'Ch',
    'J',
    '-er',
    '-ar',
    '-or',
    'th',
  ]

  const backingSoundOrder = [
    '2 syllables',
    '3 syllables',
    'P',
    'B',
    'M',
    'W',
    'Final P',
    'Final K',
    'Sp-',
    'Sm-',
    'Sn-',
    'Sk-',
    'Final T',
    'T',
    'D',
    'Final -ts',
    'Final -ps',
    'Final -ks',
    'L',
    'R',
    'S',
    'Z',
    'F',
    'V',
    'Sh',
    'Ch',
    'J',
    '-er',
    '-ar',
    '-or',
    'th',
  ]

  const hasFronting = errors.some(error => error.pattern === 'Fronting')
  const hasBacking = errors.some(error => error.pattern === 'Backing')

  let sortedSounds: ProcessedError[] = []
  let week = 1
  let selectedOrder = soundOrder

  if (hasFronting) {
    selectedOrder = frontingSoundOrder
  } else if (hasBacking) {
    selectedOrder = backingSoundOrder
  }

  selectedOrder.forEach(sound => {
    errors.forEach(error => {
      if (error.sound === sound) {
        sortedSounds.push({ ...error, targetSound: sound, week })
        week++
      }
    })
  })

  return sortedSounds
}

function createDocumentObject(studentInfo: StudentInfo, errors: ProcessedError[], screening: any) {
  // Map screening results to actual template names
  const getTemplateName = (
    result: string,
    qualifiesForSpeechProgram: boolean,
    sub: boolean,
  ): string => {
    // Handle special cases first
    if (result === 'no_errors') {
      return 'No Errors'
    }

    if (result === 'age_appropriate') {
      return 'Passed Age Appropriate'
    }

    if (result === 'complex_needs') {
      return 'Complex Needs'
    }

    if (result === 'unable_to_screen') {
      return 'Non Compliant'
    }

    if (result === 'absent') {
      return 'Absent'
    }

    if (result === 'non_registered_no_consent') {
      return 'Non Registered No Consent'
    }

    // Handle severity levels (mild, moderate, severe, profound)
    if (['mild', 'moderate', 'severe', 'profound'].includes(result)) {
      if (qualifiesForSpeechProgram || sub) {
        return 'Mild Profound Qualified Sub'
      } else {
        return 'Mild Profound No Qualified Sub'
      }
    }

    // Default fallback
    console.warn(`Unexpected result value: ${result}`)
    return '(M) Mild:Moderate (Monitor)'
  }

  // Extract screening metadata from error_patterns
  const errorPatterns = screening.error_patterns || {}
  const screeningMetadata = errorPatterns.screening_metadata || {}
  const qualifiesForSpeechProgram = screeningMetadata.qualifies_for_speech_program || false
  const sub = screeningMetadata.sub || false

  return {
    metadata: {
      file_name: `${studentInfo.first_name}_${studentInfo.last_name}-SR`,
      directory: studentInfo.grade.replace('/', '-'),
    },
    template: {
      name: getTemplateName(studentInfo.speech_screen_result, qualifiesForSpeechProgram, sub),
      version: 1,
    },
    context: {
      student_name: `${studentInfo.first_name} ${studentInfo.last_name}`,
      grade: studentInfo.grade,
      result: studentInfo.speech_screen_result,
      code: studentInfo.school_code,
      date_of_screening: studentInfo.date,
      errors,
    },
  }
}

function getErrorPatternsLookup() {
  return {
    '2 syllables': {
      'Weak Syllable Deletion': {
        pattern: 'Weak Syllable Deletion',
        example: "'_raff' for giraffe",
      },
      'Syllable Addition': {
        pattern: 'Syllable Addition',
        example: "'ah-uh-pple' for apple",
      },
    },
    '3 syllables': {
      'Weak Syllable Deletion': {
        pattern: 'Weak Syllable Deletion',
        example: "'buh-fly' for butterfly",
      },
      'Syllable Addition': {
        pattern: 'Syllable Addition',
        example: "'buh-uh-tterfly' for butterfly",
      },
    },
    P: {
      Omission: {
        pattern: 'Omission',
        example: "'-ig' for pig",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'(p~)ig for pig",
      },
    },
    B: {
      Omission: {
        pattern: 'Omission',
        example: "'-ug' for bug",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'(b~)ug' for bug",
      },
    },
    M: {
      Omission: {
        pattern: 'Omission',
        example: "'-oon' for moon",
      },
    },
    'Final P': {
      Omission: {
        pattern: 'Omission',
        example: "'soa-' for soap",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'soa(p~)' for soap",
      },
    },
    'Final T': {
      Omission: {
        pattern: 'Omission',
        example: "'ha-' for hat",
      },
      Backing: {
        pattern: 'Backing',
        example: "'hak' for hat",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'ha(t~)' for hat",
      },
    },
    'Final K': {
      Omission: {
        pattern: 'Omission',
        example: "'boo-' for book",
      },
      Fronting: {
        pattern: 'Fronting: “T” for K',
        example: "'boot' for book",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'boo(k~)' for book",
      },
    },
    'St-': {
      'Omits ST': {
        pattern: 'Omits ST',
        example: '"ar" for star',
      },
      'Omits S': {
        pattern: 'Omits S',
        example: "'-tar' for star",
      },
      'Omits T': {
        pattern: 'Omits T',
        example: "'s-ar' for star",
      },
      'Frontal Lisp': {
        pattern: 'Frontal Lisp',
        example: "'th-tar' for star",
      },
      'Lateral Lisp': {
        pattern: 'Lateral Lisp',
        example: "'szhtar' for star (slushy)",
      },
      Backing: {
        pattern: 'Backing: “K” for T',
        example: "'skar' for star",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'(st~)ar' for star",
      },
      'Omits S and Backing': {
        pattern: 'Omits S and Backing',
        example: "'-kar' for star",
      },
      'Frontal Lisp and Backing': {
        pattern: "Frontal Lisp and Backing: 'K' for T",
        example: "'thkar' for star",
      },
      'Lateral Lisp and Backing': {
        pattern: "Lateral Lisp and Backing: 'K' for T",
        example: "'szhkar' for star",
      },
      'Omits S and Nasalization': {
        pattern: 'Omits S and Nasalization (~ air through nose)',
        example: "'(t~)ar' for star",
      },
      'Omits T and Frontal Lisp': {
        pattern: 'Omits T and Frontal Lisp',
        example: "'th-ar' for star",
      },
      'Omits T and Lateral Lisp': {
        pattern: 'Omits T and Lateral Lisp',
        example: "'szh-ar' for star",
      },
      'Omits T and Nasalization': {
        pattern: 'Omits T and Nasalization',
        example: "'(s~)ar' for star",
      },
    },
    'Sp-': {
      'Omits SP': {
        pattern: 'Omits SP',
        example: '"--oon" for spoon',
      },
      'Omits S': {
        pattern: 'Omits S',
        example: "'-pot' for spot",
      },
      'Omits P': {
        pattern: 'Omits P',
        example: "'s-ot' for spot",
      },
      'Frontal Lisp': {
        pattern: 'Frontal Lisp',
        example: "'thpot' for spot",
      },
      'Lateral Lisp': {
        pattern: 'Lateral Lisp',
        example: "'szhpot' for spot (slushy)",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'(sp~)ot' for spot",
      },
      'Omits S and Nasalization': {
        pattern: 'Omits S and Nasalization (~ air through nose)',
        example: "'(p~)ot' for spot",
      },
      'Omits P and Frontal Lisp': {
        pattern: 'Omits P and Frontal Lisp',
        example: "'th-ot' for spot",
      },
      'Omits P and Lateral Lisp': {
        pattern: 'Omits P and Lateral Lisp',
        example: "'szh-ot' for spot",
      },
      'Omits P and Nasalization': {
        pattern: 'Omits P and Nasalization',
        example: "'(s~)ot' for spot",
      },
    },
    'Sm-': {
      'Omits SM': {
        pattern: 'Omits SM',
        example: '"--oke" for smoke',
      },
      'Omits S': {
        pattern: 'Omits S',
        example: "'-moke' for smoke",
      },
      'Omits M': {
        pattern: 'Omits M',
        example: "'s-oke' for smoke",
      },
      'Frontal Lisp': {
        pattern: 'Frontal Lisp',
        example: "'thmoke' for smoke",
      },
      'Lateral Lisp': {
        pattern: 'Lateral Lisp',
        example: "'szhmoke' for smoke",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'(sm~)ail' for smoke",
      },
      'Omits S and Nasalization': {
        pattern: 'Omits S and Nasalization (~ air through nose)',
        example: "'(n~)moke' for smoke",
      },
      'Omits M and Nasalization': {
        pattern: 'Omits M and Nasalization',
        example: "'(s~)moke' for smoke",
      },
      'Omits M and Frontal Lisp': {
        pattern: 'Omits M and Frontal Lisp',
        example: "'th-moke' for smoke",
      },
      'Omits M and Lateral Lisp': {
        pattern: 'Omits M and Lateral Lisp',
        example: "'szh-moke' for smoke",
      },
    },
    'Sn-': {
      'Omits SN': {
        pattern: 'Omits SN',
        example: '"--oh" for snow',
      },
      'Omits S': {
        pattern: 'Omits S',
        example: "'-nail' for snail",
      },
      'Omits N': {
        pattern: 'Omits N',
        example: "'s-ail' for snail",
      },
      'Frontal Lisp': {
        pattern: 'Frontal Lisp',
        example: "'thnail' for snail",
      },
      'Lateral Lisp': {
        pattern: 'Lateral Lisp',
        example: "'szhnail' for snail",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'(sn~)ail' for snail",
      },
      'Omits S and Nasalization': {
        pattern: 'Omits S and Nasalization (~ air through nose)',
        example: "'(n~)ail' for snail",
      },
      'Omits N and Nasalization': {
        pattern: 'Omits N and Nasalization',
        example: "'(s~)ail' for snail",
      },
      'Omits N and Frontal Lisp': {
        pattern: 'Omits N and Frontal Lisp',
        example: "'th-ail' for snail",
      },
      'Omits N and Lateral Lisp': {
        pattern: 'Omits N and Lateral Lisp',
        example: "'szh-ail' for snail",
      },
    },
    'Sk-': {
      'Omits SK': {
        pattern: 'Omits SK',
        example: "'--y' for sky",
      },
      'Omits S': {
        pattern: 'Omits S',
        example: "'-ky' for sky",
      },
      'Omits K': {
        pattern: 'Omits K',
        example: "'s-y' for sky",
      },
      'Frontal Lisp': {
        pattern: 'Frontal Lisp',
        example: "'thky' for sky",
      },
      'Lateral Lisp': {
        pattern: 'Lateral Lisp',
        example: "'szhky' for sky",
      },
      Fronting: {
        pattern: 'Fronting: “T” for K',
        example: "'sty' for sky",
      },
      Nasalization: {
        pattern: 'Nasalization',
        example: "'(sk~)y' for sky",
      },
      'Frontal Lisp and Fronting': {
        pattern: "Frontal Lisp and Fronting: 'T' for K",
        example: "'thty' for sky",
      },
      'Lateral Lisp and Fronting': {
        pattern: "Lateral Lisp and Fronting: 'T' for K",
        example: "'szhty' for sky",
      },
      'Omits S and Fronting': {
        pattern: "Omits S and Fronting: 'T' for K",
        example: "'-ty' for sky",
      },
      'Omits K and Frontal Lisp': {
        pattern: 'Omits K and Frontal Lisp',
        example: "'th-y' for sky",
      },
      'Omits K and Lateral Lisp': {
        pattern: 'Omits K and Lateral Lisp',
        example: "'szh-y' for sky",
      },
    },
    'Final -ts': {
      'Omits TS': {
        pattern: 'Omits TS',
        example: "'boo--' for boots",
      },
      'Omits S': {
        pattern: 'Omits S',
        example: "'boot-' for boots",
      },
      'Omits T': {
        pattern: 'Omits T',
        example: "'boo-s' for boots",
      },
      Backing: {
        pattern: 'Backing: “K” for T',
        example: "'books' for boots",
      },
      'Frontal Lisp': {
        pattern: 'Frontal Lisp',
        example: "'boot-th' for boots",
      },
      'Lateral Lisp': {
        pattern: 'Lateral Lisp',
        example: "'boot-szh' for boots (slushy)",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'boo(ts~)' for boots",
      },
      'Omits S and Backing: "K" for T': {
        pattern: "Omits S and Backing: 'K' for T",
        example: "'book-' for boots",
      },
      'Omits T and Frontal Lisp': {
        pattern: 'Omits T and Frontal Lisp',
        example: "'boo-th' for boots",
      },
      'Omits T and Lateral Lisp': {
        pattern: 'Omits T and Lateral Lisp',
        example: "'boo-szh' for boots",
      },
    },
    'Final -ps': {
      'Omits PS': {
        pattern: 'Omits PS',
        example: "'chi--' for chips",
      },
      'Omits S': {
        pattern: 'Omits S',
        example: "'chip-' for chips",
      },
      'Omits P': {
        pattern: 'Omits P',
        example: "'chi-s' for chips",
      },
      'Frontal Lisp': {
        pattern: 'Frontal Lisp',
        example: "'chipth' or chips",
      },
      'Lateral Lisp': {
        pattern: 'Lateral Lisp',
        example: "'chip-szh' for chips (slushy)",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'chi(ps~)' for chips",
      },
      'Omits P and Frontal Lisp': {
        pattern: 'Omits P and Frontal Lisp',
        example: "'chi-th' for chips",
      },
      'Omits P and Lateral Lisp': {
        pattern: 'Omits P and Lateral Lisp',
        example: "'chi-szh' for chips",
      },
    },
    'Final -ks': {
      'Omits KS': {
        pattern: 'Omits KS',
        example: "'bi--' for bikes",
      },
      'Omits S': {
        pattern: 'Omits S',
        example: "'book-' for books",
      },
      'Omits K': {
        pattern: 'Omits K',
        example: "'boo-s' for books",
      },
      Fronting: {
        pattern: 'Fronting',
        example: "'boots' for books",
      },
      'Frontal Lisp': {
        pattern: 'Frontal Lisp',
        example: "'book-th' for books",
      },
      'Lateral Lisp': {
        pattern: 'Lateral Lisp',
        example: "'book-szh' for books (slushy)",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'boo(ks~)' for books",
      },
      'Omits K and Frontal Lisp': {
        pattern: 'Omits K and Frontal Lisp',
        example: "'boot-th' for books",
      },
      'Omits K and Lateral Lisp': {
        pattern: 'Omits K and Lateral Lisp',
        example: "'boo-szh' for books",
      },
      'Omits S and Fronting': {
        pattern: 'Omits S and Fronting',
        example: "'boot-' for books",
      },
    },
    K: {
      Fronting: {
        pattern: 'Fronting',
        example: "'tootie' for cookie",
      },
      Omission: {
        pattern: 'Omission',
        example: "'-oo-ie' for cookie",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'(K~)oo(K~)ie' for cookie",
      },
    },
    G: {
      Fronting: {
        pattern: 'Fronting: “D” for G',
        example: "'dum' for gum",
      },
      Omission: {
        pattern: 'Omission',
        example: "'-um' for gum",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'(g~)um' for gum",
      },
    },
    T: {
      Backing: {
        pattern: 'Backing: “K” for T',
        example: "'cop' for top",
      },
      Omission: {
        pattern: 'Omission',
        example: "'-op' for top",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'(t~)op for top",
      },
    },
    D: {
      Backing: {
        pattern: 'Backing: “G” for D',
        example: "'gog' for dog",
      },
      Omission: {
        pattern: 'Omission',
        example: "'-og' for dog",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'(d~)og' for dog",
      },
    },
    L: {
      'Gliding w': {
        pattern: "Gliding 'W'",
        example: "'wight' for light",
      },
      'Gliding y': {
        pattern: "Gliding 'Y'",
        example: "'yight' for light",
      },
      Omission: {
        pattern: 'Omission',
        example: "'-ion' for lion",
      },
    },
    R: {
      'Gliding w': {
        pattern: "Gliding 'W'",
        example: "'wed' for red",
      },
      'Gliding y': {
        pattern: "Gliding 'Y'",
        example: "'yed' for red",
      },
      Omission: {
        pattern: 'Omission',
        example: "'-ed' for red",
      },
    },
    S: {
      Stopping: {
        pattern: 'Stopping',
        example: "'tad' for sad",
      },
      'Stopping P': {
        pattern: 'Stopping P',
        example: "'pad' for sad",
      },
      'Stopping B': {
        pattern: 'Stopping B',
        example: "'bad' for sad",
      },
      'Stopping T': {
        pattern: 'Stopping T',
        example: "'tad' for sad",
      },
      'Stopping D': {
        pattern: 'Stopping D',
        example: "'dad' for sad",
      },
      'Stopping K': {
        pattern: 'Stopping K',
        example: "'kad' for sad",
      },
      'Stopping G': {
        pattern: 'Stopping G',
        example: "'gad' for sad",
      },
      'Frontal Lisp': {
        pattern: 'Frontal Lisp',
        example: "'th-tad' for sad",
      },
      'Lateral Lisp': {
        pattern: 'Lateral Lisp',
        example: "'szhad' for sad (slushy)",
      },
      Omission: {
        pattern: 'Omission',
        example: "'-ad' for sad",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'(s~)ad' for sad",
      },
    },
    Z: {
      Stopping: {
        pattern: 'Stopping',
        example: "'doo' for zoo",
      },
      'Stopping P': {
        pattern: 'Stopping P',
        example: "'p-oo' for zoo",
      },
      'Stopping B': {
        pattern: 'Stopping B',
        example: "'boo' for zoo",
      },
      'Stopping T': {
        pattern: 'Stopping T',
        example: "'too' for zoo",
      },
      'Stopping D': {
        pattern: 'Stopping D',
        example: "'doo' for zoo",
      },
      'Stopping K': {
        pattern: 'Stopping K',
        example: "'koo' for zoo",
      },
      'Stopping G': {
        pattern: 'Stopping G',
        example: "'goo' for zoo",
      },
      'Sibilant S': {
        pattern: 'Sibilant S',
        example: "'sombie' for zombie",
      },
      'Frontal Lisp': {
        pattern: 'Frontal Lisp',
        example: "'thoo' for zoo",
      },
      'Lateral Lisp': {
        pattern: 'Lateral Lisp',
        example: "'szhoo' for zoo (slushy)",
      },
      Omission: {
        pattern: 'Omission',
        example: "'-oo' for zoo",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'(Z~)oo' for zoo",
      },
    },
    Ch: {
      Stopping: {
        pattern: 'Stopping',
        example: "'ticken' for chicken",
      },
      'Stopping P': {
        pattern: 'Stopping P',
        example: "'picken' for chicken",
      },
      'Stopping B': {
        pattern: 'Stopping B',
        example: "'bicken' for chicken",
      },
      'Stopping T': {
        pattern: 'Stopping T',
        example: "'ticken' for chicken",
      },
      'Stopping D': {
        pattern: 'Stopping D',
        example: "'dicken' for chicken",
      },
      'Stopping K': {
        pattern: 'Stopping K',
        example: "'kicken' for chicken",
      },
      'Stopping G': {
        pattern: 'Stopping G',
        example: "'gicken' for chicken",
      },
      'Lateral Lisp': {
        pattern: 'Lateral Lisp',
        example: "'szhicken' for chicken (slushy)",
      },
      Omission: {
        pattern: 'Omission',
        example: "'-icken' for chicken",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'(ch~)icken' for chicken",
      },
    },
    Sh: {
      Stopping: {
        pattern: 'Stopping',
        example: "'tip' for ship",
      },
      'Stopping P': {
        pattern: 'Stopping P',
        example: "'pip' for ship",
      },
      'Stopping B': {
        pattern: 'Stopping B',
        example: "'bip' for ship",
      },
      'Stopping T': {
        pattern: 'Stopping T',
        example: "'tip' for ship",
      },
      'Stopping D': {
        pattern: 'Stopping D',
        example: "'dip' for ship",
      },
      'Stopping K': {
        pattern: 'Stopping K',
        example: "'kip' for ship",
      },
      'Stopping G': {
        pattern: 'Stopping G',
        example: "'gip' for ship",
      },
      'Sibilant S': {
        pattern: 'Sibilant S',
        example: "'soo' for zoo",
      },
      'Lateral Lisp': {
        pattern: 'Lateral Lisp',
        example: "'szhip' for ship (slushy)",
      },
      Omission: {
        pattern: 'Omission',
        example: "'-ip' for ship",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'[sh~]ip' for ship",
      },
    },
    J: {
      Stopping: {
        pattern: 'Stopping',
        example: "'dump' for jump",
      },
      'Stopping P': {
        pattern: 'Stopping P',
        example: "'pump' for jump",
      },
      'Stopping B': {
        pattern: 'Stopping B',
        example: "'bump' for jump",
      },
      'Stopping T': {
        pattern: 'Stopping T',
        example: "'tump' for jump",
      },
      'Stopping D': {
        pattern: 'Stopping D',
        example: "'dump' for jump",
      },
      'Stopping K': {
        pattern: 'Stopping K',
        example: "'kump' for jump",
      },
      'Stopping G': {
        pattern: 'Stopping G',
        example: "'gump' for jump",
      },
      'Lateral Lisp': {
        pattern: 'Lateral Lisp',
        example: "'dzhump' or jump (slushy)",
      },
      Omission: {
        pattern: 'Omission',
        example: "'-ump' for jump",
      },
      Nasalization: {
        pattern: 'Nasalization (~ air through nose)',
        example: "'(j~)ump' for jump",
      },
    },
    F: {
      'Stopping F': {
        pattern: 'Stopping',
        example: "'pish' for fish",
      },
      'Stopping P': {
        pattern: 'Stopping P',
        example: "'pish' for fish",
      },
      'Stopping B': {
        pattern: 'Stopping B',
        example: "'bish' for fish",
      },
      'Stopping T': {
        pattern: 'Stopping T',
        example: "'tish' for fish",
      },
      'Stopping D': {
        pattern: 'Stopping D',
        example: "'dish' for fish",
      },
      'Stopping K': {
        pattern: 'Stopping K',
        example: "'kish' for fish",
      },
      'Stopping G': {
        pattern: 'Stopping G',
        example: "'gish' for fish",
      },
      Omission: {
        pattern: 'Omission',
        example: "'-ish' for fish",
      },
    },
    V: {
      Stopping: {
        pattern: 'Stopping',
        example: "'bery' for very",
      },
      'Stopping P': {
        pattern: 'Stopping P',
        example: "'pery' for very",
      },
      'Stopping B': {
        pattern: 'Stopping B',
        example: "'bery' for very",
      },
      'Stopping T': {
        pattern: 'Stopping T',
        example: "'tery' for very",
      },
      'Stopping D': {
        pattern: 'Stopping D',
        example: "'dery' for very",
      },
      'Stopping K': {
        pattern: 'Stopping K',
        example: "'kery' for very",
      },
      'Stopping G': {
        pattern: 'Stopping G',
        example: "'gery' for very",
      },
      Omission: {
        pattern: 'Omission',
        example: "'-ery' for very",
      },
    },
    '-er': {
      Vowelization: {
        pattern: 'Vowelization',
        example: "'flowuh' for flower",
      },
    },
    '-ar': {
      Vowelization: {
        pattern: 'Vowelization',
        example: "'cah' for car",
      },
      'Vowelization w': {
        pattern: 'Vowelization "w"',
        example: "'caw' for car",
      },
      'Vowelization y': {
        pattern: 'Vowelization "y"',
        example: "'cah-y' for car",
      },
    },
    '-or': {
      Vowelization: {
        pattern: 'Vowelization',
        example: "'doh' for door",
      },
      'Vowelization oh/w': {
        pattern: 'Vowelization "oh/w"',
        example: "'doh' for door",
      },
      'Vowelization y': {
        pattern: 'Vowelization "y"',
        example: "'do-y' for door",
      },
    },
    th: {
      Stopping: {
        pattern: 'Stopping',
        example: "'tum' for thumb",
      },
      'Stopping P': {
        pattern: 'Stopping P',
        example: "'pum' for thumb",
      },
      'Stopping B': {
        pattern: 'Stopping B',
        example: "'bum' for thumb",
      },
      'Stopping T': {
        pattern: 'Stopping T',
        example: "'tum' for thumb",
      },
      'Stopping D': {
        pattern: 'Stopping D',
        example: "'dum' for thumb",
      },
      'Stopping K': {
        pattern: 'Stopping K',
        example: "'kum' for thumb",
      },
      'Stopping G': {
        pattern: 'Stopping G',
        example: "'gum' for thumb",
      },
      'Sibilant error (s, f)': {
        pattern: 'Sibilant Error',
        example: "'sum' [or] 'fum' for thumb",
      },
      'Sibilant Substitution (F)': {
        pattern: "Sibilant Substitution 'F'",
        example: "'fum' for thumb",
      },
      'Sibilant Substitution (S)': {
        pattern: "Sibilant Substitution 'S'",
        example: "'sum' for thumb",
      },
      Omission: {
        pattern: 'Omission',
        example: "'-um' for thumb",
      },
    },
  }
}
