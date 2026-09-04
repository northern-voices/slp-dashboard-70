// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { AwsClient } from 'npm:aws4fetch@1'
import QRCode from 'npm:qrcode@1.5.4'
import { classifySoundErrors } from '../_shared/goalSheetLevels.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.info('Goal sheet function started')

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
async function sendReportLinkEmail({ recipients, subject, reportLabel, links }) {
  const accessKeyId = Deno.env.get('AWS_SES_ACCESS_KEY_ID')
  const secretAccessKey = Deno.env.get('AWS_SES_SECRET_ACCESS_KEY')
  const region = Deno.env.get('AWS_SES_REGION')
  const senderEmail = Deno.env.get('REPORT_SENDER_EMAIL')

  const aws = new AwsClient({ accessKeyId, secretAccessKey, region, service: 'ses' })

  // One button per link. When there's more than one (e.g. Level 1 + Level 2
  // sent together), each button gets a small label above it so the recipient
  // knows which is which.
  const buttonsHtml = links
    .map(
      (link, i) => `
                  <div style="text-align: center; margin-bottom: ${
                    i < links.length - 1 ? '16px' : '32px'
                  };">
                    ${
                      links.length > 1
                        ? `<p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #374151;">${link.label}</p>`
                        : ''
                    }
                    <a href="${link.url}" style="display: inline-block; background-color: #005AE0; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px;">
                      View Report
                    </a>
                  </div>`,
    )
    .join('')

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
                  ${buttonsHtml}
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
    const { speech_screening_id, level, override_emails, generated_by, password } = await req.json()
    if (!speech_screening_id) {
      throw new Error('speech_screening_id is required')
    }
    if (level !== 1 && level !== 2 && level !== 'both') {
      throw new Error("level is required and must be 1, 2, or 'both'")
    }
    if (!password) {
      throw new Error('password is required')
    }
    console.log(`Processing goal sheet for speech screening: ${speech_screening_id}`)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    // 1. Get speech screening with all related data
    const screeningUrl = `${supabaseUrl}/rest/v1/speech_screenings?id=eq.${speech_screening_id}&select=*,students(*,schools(*)),school_grades(*)`
    const screeningResponse = await fetch(screeningUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })
    if (!screeningResponse.ok) {
      throw new Error(`Failed to fetch speech screening: ${screeningResponse.status}`)
    }
    const screenings = await screeningResponse.json()
    if (!screenings || screenings.length === 0) {
      throw new Error('Speech screening not found')
    }
    const screening = screenings[0]
    console.log(
      `Found screening for student: ${screening.students.first_name} ${screening.students.last_name}`,
    )

    // 3. Extract student info
    const studentInfo = {
      first_name: screening.students.first_name,
      last_name: screening.students.last_name,
      grade: screening.school_grades?.grade_level || '',
      email: '',
      date: new Date(screening.created_at).toISOString().split('T')[0],
      school: screening.students.schools?.name || '',
      speech_screen_result: screening.result?.replace('/', ':') || '',
      vocabulary_support: screening.vocabulary_support || false,
    }

    // 2. Process error patterns for both levels up front. Each level's document
    //    shows both tables (current sounds + what's completed/upcoming), and
    //    "both" mode needs both documents anyway, so there's no per-level
    //    savings to computing only one at a time.
    const errorsByLevel = {
      1: await processErrorPatterns(screening.error_patterns || {}, 1, studentInfo.grade),
      2: await processErrorPatterns(screening.error_patterns || {}, 2, studentInfo.grade),
    }
    console.log(
      `Processed ${errorsByLevel[1].length} Level 1 and ${errorsByLevel[2].length} Level 2 errors for goal sheet`,
    )

    // "Both" mode skips a level that comes back with nothing - this happens for
    // a grade-1+ student whose only errors are later-developing sounds, which
    // classifySoundErrors relabels entirely as Level 1 (see goalSheetLevels.ts),
    // leaving Level 2 empty. Sending a blank second link would look broken.
    const levelsToSend =
      level === 'both' ? [1, 2].filter(lvl => errorsByLevel[lvl].length > 0) : [level]
    if (levelsToSend.length === 0) {
      throw new Error('No sound errors found for this speech screening')
    }

    // 4. Determine recipient emails: use override_emails if provided, else fall back to staging table email
    let recipientEmails = Array.isArray(override_emails) ? override_emails.filter(Boolean) : []
    if (recipientEmails.length === 0) {
      const stagingUrl = `${supabaseUrl}/rest/v1/speech_screenings_staging?Student=eq.${studentInfo.first_name} ${studentInfo.last_name}&select=Email`
      const stagingResponse = await fetch(stagingUrl, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      })
      if (stagingResponse.ok) {
        const stagingData = await stagingResponse.json()
        if (stagingData && stagingData.length > 0 && stagingData[0].Email) {
          recipientEmails = [stagingData[0].Email]
        }
      }
      if (recipientEmails.length === 0) {
        throw new Error(
          'Student email not found. Please provide override_emails or ensure email is in staging table.',
        )
      }
    }
    studentInfo.email = recipientEmails[0]

    // 5. Create a document object + password-protected report token per requested
    //    level (this becomes the report_data behind each token's password gate).
    //    "both" mode creates two tokens sharing the same password, delivered as
    //    two links in a single email below.
    const tokens = []
    for (const lvl of levelsToSend) {
      const documentObject = createDocumentObject(
        studentInfo,
        errorsByLevel[lvl],
        lvl,
        errorsByLevel[lvl === 1 ? 2 : 1],
      )
      // 6. Create a password-protected report token instead of emailing the PDF
      //    directly (the doc-gen Lambda never returns PDF bytes and always
      //    attaches a real PDF whenever it emails, so it can't be used for a
      //    link-only notification)
      const token = await createReportToken({
        supabaseUrl,
        supabaseKey,
        password,
        reportType: 'goal_sheet',
        reportData: documentObject,
        studentId: screening.student_id,
        schoolId: screening.students.school_id,
        createdBy: generated_by,
      })
      tokens.push({ level: lvl, token })
    }

    const links = tokens.map(({ level: lvl, token }) => ({
      label: levelsToSend.length > 1 ? `Level ${lvl} Goal Sheet` : 'View Report',
      url: `${Deno.env.get('APP_BASE_URL')}/view-report/${token}`,
    }))

    console.log(`Sending secure report link(s) to ${recipientEmails.join(', ')}...`)

    await sendReportLinkEmail({
      recipients: recipientEmails,
      subject: levelsToSend.length > 1 ? `NVSS Student Goal Sheets` : `NVSS Student Goal Sheet`,
      reportLabel:
        levelsToSend.length > 1
          ? `${studentInfo.first_name} ${studentInfo.last_name}'s goal sheets`
          : `${studentInfo.first_name} ${studentInfo.last_name}'s goal sheet`,
      links,
    })

    console.log(`Secure report link(s) sent successfully`)
    // 8. Log the generation in reports table (one row per level sent)
    const reportInsertUrl = `${supabaseUrl}/rest/v1/reports`
    for (const { level: lvl, token } of tokens) {
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
          speech_screening_id: speech_screening_id,
          report_type: 'speech_goals_report',
          file_key:
            levelsToSend.length > 1
              ? `goal_sheet_${speech_screening_id}_level${lvl}`
              : `goal_sheet_${speech_screening_id}`,
          generated_by: generated_by || null,
          metadata: {
            sent_to: recipientEmails,
            level: lvl,
            errors_count: errorsByLevel[lvl].length,
            vocabulary_support: studentInfo.vocabulary_support,
            grade_level: studentInfo.grade,
            delivery_method: 'password_protected_link',
            report_token: token,
          },
        }),
      })
    }

    const responseBody = {
      success: true,
      message: `Goal sheet${levelsToSend.length > 1 ? 's' : ''} generated and a secure link${
        levelsToSend.length > 1 ? 's' : ''
      } sent to ${recipientEmails.join(', ')}`,
      student_name: `${studentInfo.first_name} ${studentInfo.last_name}`,
      grade_level: studentInfo.grade,
    }
    if (levelsToSend.length > 1) {
      responseBody.levels = levelsToSend
      responseBody.errors_count = levelsToSend.reduce((sum, lvl) => sum + errorsByLevel[lvl].length, 0)
    } else {
      responseBody.level = levelsToSend[0]
      responseBody.errors_count = errorsByLevel[levelsToSend[0]].length
    }

    return new Response(JSON.stringify(responseBody), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    })
  } catch (error) {
    console.error('Error generating goal sheet:', error)
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

// Processes error patterns from JSONB, restricted to sounds classified as the
// requested Level (see _shared/goalSheetLevels.ts for the classification rules,
// including the grade-1+ override that grade needs to be passed through for).
async function processErrorPatterns(errorPatterns, level, grade) {
  if (!errorPatterns || typeof errorPatterns !== 'object') {
    return []
  }

  // Parse the JSONB if it's a string
  let patterns = errorPatterns
  if (typeof errorPatterns === 'string') {
    try {
      patterns = JSON.parse(errorPatterns)
    } catch (e) {
      console.error('Failed to parse error_patterns JSON:', e)
      return []
    }
  }

  const allProcessedErrors = []

  // Extract sound errors from articulation.soundErrors array
  const soundErrors = patterns?.articulation?.soundErrors || []
  if (!Array.isArray(soundErrors)) {
    console.warn('soundErrors is not an array:', soundErrors)
    return []
  }

  console.log('Processing sound errors for goal sheet:', soundErrors)

  const {
    levels: soundLevels,
    escalatedBaseSounds,
    forcedWordSounds,
  } = classifySoundErrors(
    soundErrors.map(e => ({
      sound: e?.sound || 'Unknown',
      errorPatterns: (e?.errorPatterns || []).filter(p => p !== 'Stimulability'),
      stimulabilityOptions: e?.stimulabilityOptions || [],
    })),
    grade,
  )

  // Get the comprehensive error patterns lookup
  const errorPatternsLookup = getErrorPatternsLookup()

  // MAIN PROCESSING LOOP
  for (const soundError of soundErrors) {
    if (!soundError || typeof soundError !== 'object') {
      continue
    }

    const sound = soundError.sound || 'Unknown'
    const errorPatterns = (soundError.errorPatterns || []).filter(p => p !== 'Stimulability')
    const otherNotes = soundError.otherNotes || ''
    const stoppingSounds = soundError.stoppingSounds || []
    // A blend that successfully deferred to this level via a reclassification
    // rule always displays at Word, regardless of its own recorded value.
    const stimulabilityOptions = forcedWordSounds.has(sound)
      ? ['Word']
      : soundError.stimulabilityOptions || []

    // Skip sounds with no error patterns
    if (!Array.isArray(errorPatterns) || errorPatterns.length === 0) {
      continue
    }

    if (soundLevels.get(sound) !== level) {
      console.log(`Skipping sound "${sound}" - not Level ${level}`)
      continue
    }

    // Process the sound error
    await processIndividualSoundError(
      sound,
      errorPatterns,
      otherNotes,
      stoppingSounds,
      stimulabilityOptions,
      errorPatternsLookup,
      allProcessedErrors,
    )
  }

  // A base sound (T, K, S, ...) held back from deferring its blends because it
  // hasn't reached Word yet gets its own entry on the Level 2 document instead,
  // always at Word - reusing its own trigger pattern's existing content (e.g.
  // T's Backing strategies), since it's the same sound/pattern combo already
  // used for its Level 1 entry.
  if (level === 2) {
    for (const base of escalatedBaseSounds) {
      await processIndividualSoundError(
        base.sound,
        base.errorPatterns,
        '',
        [],
        ['Word'],
        errorPatternsLookup,
        allProcessedErrors,
      )
    }
  }

  console.log(
    `Final result: ${allProcessedErrors.length} Level ${level} errors (${allProcessedErrors
      .map(e => e.sound)
      .join(', ')})`,
  )

  return sortPhonologicalProcesses(allProcessedErrors, level === 1)
}

// Helper function to process individual sound errors (extracted to avoid duplication)
async function processIndividualSoundError(
  sound,
  errorPatterns,
  otherNotes,
  stoppingSounds,
  stimulabilityOptions,
  errorPatternsLookup,
  allProcessedErrors,
) {
  const stimulabilityLevel = (stimulabilityOptions?.[0] || 'word').toLowerCase()
  const goalSheetContent = getGoalSheetContent()

  // Resolves strategies + QR videos by trying each candidate key in order
  // (mirroring the same fallback chain used for pattern/example above),
  // falling back to the generic set if nothing has been transcribed yet.
  const pushError = async (pattern, example, ...strategyKeyCandidates) => {
    let content
    for (const key of strategyKeyCandidates) {
      const candidate = goalSheetContent[sound]?.[key]
      if (candidate) {
        content = candidate
        break
      }
    }
    if (!content) content = { qrCategories: [], strategies: GENERIC_FALLBACK_STRATEGIES }

    allProcessedErrors.push({
      sound: sound,
      pattern: pattern,
      example: example,
      targetSound: sound,
      stimulability_option: stimulabilityLevel,
      strategies: content.strategies,
      qrVideos: await buildQrVideos(content.qrCategories),
    })
  }

  // Handle multiple error patterns for the same sound
  if (Array.isArray(errorPatterns) && errorPatterns.length > 0) {
    // Check if we have multiple error patterns that should be combined
    if (errorPatterns.length > 1) {
      // Try to find a combined pattern in the lookup table
      const normalizedPatterns = errorPatterns.map(p =>
        p
          .replace(/\(Omits/g, '(omits')
          .replace(/\u201C/g, '')
          .replace(/\u201D/g, '')
          .replace(/"/g, '')
          .replace(/'/g, ''),
      )
      const combinedKey = normalizedPatterns.join(' and ')
      let errorInfo = errorPatternsLookup[sound]?.[combinedKey]

      // If not found, try reverse order
      let reversedKey
      if (!errorInfo && normalizedPatterns.length === 2) {
        reversedKey = normalizedPatterns.reverse().join(' and ')
        errorInfo = errorPatternsLookup[sound]?.[reversedKey]
      }

      if (errorInfo) {
        // Found combined pattern in lookup table
        await pushError(
          errorInfo.pattern,
          otherNotes || errorInfo.example,
          combinedKey,
          reversedKey,
        )
      } else {
        // No combined pattern found, process each pattern individually
        for (const pattern of errorPatterns) {
          if (pattern === 'Other') {
            await pushError(
              `Atypical Substitution`,
              otherNotes?.toLowerCase() || 'Error detected',
              'Other',
            )
          } else if (pattern === 'Stopping' && stoppingSounds.length > 0) {
            const stoppingSound = stoppingSounds[0]
            const stoppingKey = `Stopping ${stoppingSound}`
            let errorInfo =
              errorPatternsLookup[sound]?.[stoppingKey] || errorPatternsLookup[sound]?.[pattern]

            await pushError(
              errorInfo?.pattern || pattern,
              otherNotes?.toLowerCase() || errorInfo?.example || 'Error detected',
              stoppingKey,
              pattern,
            )
          } else {
            const normalizedPattern = pattern
              .replace(/\(Omits/g, '(omits')
              .replace(/\u201C/g, '')
              .replace(/\u201D/g, '')
              .replace(/"/g, '')
              .replace(/'/g, '')

            const individualErrorInfo = errorPatternsLookup[sound]?.[normalizedPattern]

            await pushError(
              individualErrorInfo?.pattern || pattern,
              otherNotes?.toLowerCase() || individualErrorInfo?.example || 'Error detected',
              normalizedPattern,
              pattern,
            )
          }
        }
      }
    } else {
      // Single error pattern
      const pattern = errorPatterns[0]

      if (pattern === 'Other') {
        await pushError(
          `Atypical Substitution`,
          otherNotes?.toLowerCase() || 'Error detected',
          'Other',
        )
      } else if (pattern === 'Stopping' && stoppingSounds.length > 0) {
        const stoppingSound = stoppingSounds[0]
        const stoppingKey = `Stopping ${stoppingSound}`
        let errorInfo =
          errorPatternsLookup[sound]?.[stoppingKey] || errorPatternsLookup[sound]?.[pattern]

        await pushError(
          errorInfo?.pattern || pattern,
          otherNotes?.toLowerCase() || errorInfo?.example || 'Error detected',
          stoppingKey,
          pattern,
        )
      } else {
        let errorInfo = errorPatternsLookup[sound]?.[pattern]
        let normalizedPattern = pattern

        if (!errorInfo) {
          normalizedPattern = pattern
            .replace(/\(Omits/g, '(omits')
            .replace(/\u201C/g, '')
            .replace(/\u201D/g, '')
            .replace(/"/g, '')
            .replace(/'/g, '')
            .replace(/\\/g, '')

          errorInfo = errorPatternsLookup[sound]?.[normalizedPattern]
        }

        await pushError(
          errorInfo?.pattern || pattern,
          otherNotes?.toLowerCase() || errorInfo?.example || 'Error detected',
          pattern,
          normalizedPattern,
        )
      }
    }
  } else {
    // Fallback if no errorPatterns
    await pushError('Error detected', otherNotes?.toLowerCase() || 'Error detected')
  }
}

function sortPhonologicalProcesses(errors, isPrimary) {
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
    'Final -ts',
    'Final -ps',
    'Final -ks',
    'K',
    'G',
    'T',
    'D',
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

  // This order assumes fronting ONLY
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

  // This order assumes backing ONLY
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

  // Special order for goal sheets when specific backing patterns are present
  const goalSheetBackingOrder = [
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
    'T',
    'D',
    'Final T',
    'St-',
    'Final -ts',
    'Final -ps',
    'Final -ks',
    'K',
    'G',
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

  // Check for specific backing patterns for goal sheet special ordering
  const hasStBacking = errors.some(
    error => error.sound === 'St-' && error.pattern.includes('Backing'),
  )
  const hasTBacking = errors.some(error => error.sound === 'T' && error.pattern.includes('Backing'))
  const hasDBacking = errors.some(error => error.sound === 'D' && error.pattern.includes('Backing'))

  // Check for specific fronting patterns for goal sheet special ordering
  const hasSkFronting = errors.some(
    error => error.sound === 'Sk-' && error.pattern.includes('Fronting'),
  )
  const hasFinalKsFronting = errors.some(
    error => error.sound === 'Final -ks' && error.pattern.includes('Fronting'),
  )
  const hasKFronting = errors.some(
    error => error.sound === 'K' && error.pattern.includes('Fronting'),
  )
  const hasGFronting = errors.some(
    error => error.sound === 'G' && error.pattern.includes('Fronting'),
  )

  // Use special goal sheet order if ANY of the three backing conditions are met
  const useGoalSheetBackingOrder = hasStBacking || hasTBacking || hasDBacking

  // Use special fronting order if ANY of the four fronting conditions are met
  const useGoalSheetFrontingOrder =
    hasSkFronting || hasFinalKsFronting || hasKFronting || hasGFronting

  // Special order for goal sheets when specific fronting patterns are present
  const goalSheetFrontingOrder = [
    '2 syllables',
    '3 syllables',
    'P',
    'B',
    'M',
    'W',
    'Final P',
    'Final T',
    'St-',
    'Sp-',
    'Sm-',
    'Sn-',
    'K',
    'G',
    'Final K',
    'Sk-',
    'Final -ks',
    'Final -ts',
    'Final -ps',
    'T',
    'D',
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

  let sortedSounds = []
  let selectedOrder = soundOrder

  if (useGoalSheetBackingOrder) {
    selectedOrder = goalSheetBackingOrder
    console.log('Using special goal sheet backing order: St-, T, or D backing detected')
  } else if (useGoalSheetFrontingOrder) {
    selectedOrder = goalSheetFrontingOrder
    console.log(
      'Using special goal sheet fronting order: Sk-, Final -ks, K, or G fronting detected',
    )
  } else if (hasFronting) {
    selectedOrder = frontingSoundOrder
  } else if (hasBacking) {
    selectedOrder = backingSoundOrder
  }

  selectedOrder.forEach(sound => {
    errors.forEach(error => {
      if (error.sound === sound) {
        sortedSounds.push({
          ...error,
          targetSound: sound,
        })
      }
    })
  })

  return sortedSounds
}

// One level's sounds get full worksheet pages (Level 1 and Level 2 are
// generated and sent separately, never combined onto the same goal sheet's
// worksheet pages). The summary table at the top, however, always shows both
// levels side by side - level_1_table_errors/level_2_table_errors - so the
// SLP can see what's being worked on now alongside what's done/upcoming.
function toTableErrors(errors) {
  return (errors || []).filter(e => {
    const p = e.pattern?.toLowerCase().trim()
    return p !== 'stimulability' && p !== 'error detected'
  })
}

function createDocumentObject(studentInfo, errors, level, otherLevelErrors) {
  const contextErrors = errors || []
  const otherErrors = otherLevelErrors || []

  return {
    metadata: {
      file_name: `${studentInfo.first_name} ${studentInfo.last_name}: NVSS Goal Sheet (Level ${level})`,
    },
    template: {
      name: 'Goal Sheet Primary Only v2',
      version: 1,
    },
    context: {
      student_name: `${studentInfo.first_name} ${studentInfo.last_name}`,
      date_of_screening: studentInfo.date,
      school: studentInfo.school,
      grade: studentInfo.grade,
      vocabulary_support: studentInfo.vocabulary_support,
      level,
      primary_errors: contextErrors,
      secondary_errors: [],
      primary_table_errors: toTableErrors(contextErrors),
      secondary_table_errors: [],
      level_1_table_errors: toTableErrors(level === 1 ? contextErrors : otherErrors),
      level_2_table_errors: toTableErrors(level === 2 ? contextErrors : otherErrors),
    },
  }
}

// ---------------------------------------------------------------------------
// Goal sheet strategies + QR training videos
//
// Sourced from "SOUND STRATEGIES: GOAL SHEETS" (Sound Strategies team) and the
// training-video spreadsheet. Each sound/error-pattern combination below adds
// two things on top of the existing pattern/example lookup:
//   - qrCategories: which training video(s) to show (looked up in
//     QR_VIDEO_CATALOG). A pattern can legitimately need more than one video
//     (e.g. "Omission" needing both a general omission technique video and a
//     sound-specific placement video) - these are NOT duplicates.
//   - strategies: three checklists (wordPhrase, sound, audDiscrim), one of
//     which is shown on the goal sheet based on the student's recorded
//     stimulability level for that sound error.
// Sounds/patterns not yet transcribed fall back to GENERIC_FALLBACK_STRATEGIES
// with no QR video (silently omitted, per product decision - no video is
// better than a broken/placeholder one).
// ---------------------------------------------------------------------------

// category -> { title, url }. Direct Vimeo links (no Squarespace dependency).
const QR_VIDEO_CATALOG = {
  Syllables: { title: 'Syllables', url: 'https://vimeo.com/1020729407/1ce80face3' },
  'P/B': { title: 'P/B', url: 'https://vimeo.com/1020695224/a1a6d1bc39' },
  M: { title: 'M', url: 'https://vimeo.com/1020695295/abb0936990' },
  'Initial Consonant Deletion': {
    title: 'Initial Consonant Deletion',
    url: 'https://vimeo.com/1020610791/f0c67cb7bf',
  },
  'Final Consonant Deletion': {
    title: 'Final Consonant Deletion',
    url: 'https://vimeo.com/1020734047/25e9409f62',
  },
  'K/G': { title: 'K/G', url: 'https://vimeo.com/1020610974/1ef060ca70' },
  'T/D': { title: 'T/D', url: 'https://vimeo.com/1020697687/3f1620d4d6' },
  'S/Z': { title: 'S/Z', url: 'https://vimeo.com/1020729620/61ed3f0a7c' },
  'Initial S Blends': {
    title: 'Initial S Blends',
    url: 'https://vimeo.com/1020610884/614842882e',
  },
  'Final S Blends': { title: 'Final S Blends', url: 'https://vimeo.com/1020695465/3c7e5a8b2f' },
  'Frontal Lisp': { title: 'Frontal Lisp', url: 'https://vimeo.com/1020610748/2882137929' },
  'Lateral Lisp': { title: 'Lateral Lisp', url: 'https://vimeo.com/1020695380/252c5a4704' },
  L: { title: 'L', url: 'https://vimeo.com/1020611037/53edfcf0f7' },
  R: { title: 'R', url: 'https://vimeo.com/1020695049/6d3b13119a' },
  'CH/J': { title: 'CH/J', url: 'https://vimeo.com/1020612226/17b7d8ad59' },
  'F/V': { title: 'F/V', url: 'https://vimeo.com/1020612155/6980e19f82' },
  'SH/ZH': { title: 'SH/ZH', url: 'https://vimeo.com/1020729526/9b8ac7395b' },
  TH: { title: 'TH', url: 'https://vimeo.com/1020698326/115e8deee9' },
  'Final ER/AR/OR': {
    title: 'Final ER/AR/OR',
    url: 'https://vimeo.com/1020611126/1a341619fd',
  },
  // "Animated Articulation" videos added in the 2026-09 goal sheet revision.
  // No 'Animated OR' entry yet - no video has been made for it (see Notion).
  'Animated P': { title: 'Animated P', url: 'https://vimeo.com/1146679616/c0265c82bf' },
  'Animated B': { title: 'Animated B', url: 'https://vimeo.com/1146679164/72794f685b' },
  'Animated M': { title: 'Animated M', url: 'https://vimeo.com/1146679276/b453896db8' },
  'Animated N': { title: 'Animated N', url: 'https://vimeo.com/1146678666/715e3d3afa' },
  'Animated K': { title: 'Animated K', url: 'https://vimeo.com/1146679331/389369778f' },
  'Animated G': { title: 'Animated G', url: 'https://vimeo.com/1146679223/2e730c0df0' },
  'Animated T': { title: 'Animated T', url: 'https://vimeo.com/1146679640/fad4c2cae7' },
  'Animated D': { title: 'Animated D', url: 'https://vimeo.com/1146678929/445e4eecb2' },
  'Animated S': { title: 'Animated S', url: 'https://vimeo.com/1146679586/bb32bdd614' },
  'Animated Z': { title: 'Animated Z', url: 'https://vimeo.com/1146678845/2b3f0e0446' },
  'Animated Sh': { title: 'Animated Sh', url: 'https://vimeo.com/1146679561/abb8ea225a' },
  'Animated Ch': { title: 'Animated Ch', url: 'https://vimeo.com/1146679123/e628fec42b' },
  'Animated J': { title: 'Animated J', url: 'https://vimeo.com/1146679472/c37f4c1b2f' },
  'Animated F': { title: 'Animated F', url: 'https://vimeo.com/1146679779/4b88e28860' },
  'Animated V': { title: 'Animated V', url: 'https://vimeo.com/1146679697/74fd95377a' },
  'Animated L': { title: 'Animated L', url: 'https://vimeo.com/1146679206/ab5bbb2b6e' },
  'Animated R': { title: 'Animated R', url: 'https://vimeo.com/1146679515/cf037d6588' },
  'Animated TH': { title: 'Animated TH', url: 'https://vimeo.com/1146679384/39cc94107a' },
  'Animated AR': { title: 'Animated AR', url: 'https://vimeo.com/1146678866/31df6db9f2' },
  'Animated ER': { title: 'Animated ER', url: 'https://vimeo.com/1146678889/6e73e09290' },
}

// Generate a QR code PNG (as a data URI) for a video URL.
async function generateQrDataUri(url) {
  return QRCode.toDataURL(url, { width: 200, margin: 1 })
}

// Resolve a list of QR categories to their (deduped) video info, complete
// with a generated QR code data URI. Categories with no catalog entry yet
// (video not made) are silently dropped.
const qrDataUriCache = new Map()
async function buildQrVideos(qrCategories) {
  const uniqueCategories = [...new Set(qrCategories || [])]
  const videos = []
  for (const category of uniqueCategories) {
    const video = QR_VIDEO_CATALOG[category]
    if (!video) continue // no video made for this category yet - omit silently
    if (!qrDataUriCache.has(video.url)) {
      qrDataUriCache.set(video.url, await generateQrDataUri(video.url))
    }
    videos.push({
      category,
      title: video.title,
      url: video.url,
      dataUri: qrDataUriCache.get(video.url),
    })
  }
  return videos
}

// Used whenever a sound/pattern combination isn't in GOAL_SHEET_CONTENT yet.
const GENERIC_FALLBACK_STRATEGIES = {
  wordPhrase: [
    'Adult Model',
    'Emphasize & Exaggerate',
    'Animated Articulation',
    'Connect with SLP for specific strategies',
  ],
  sound: [
    'Adult Model',
    'Emphasize & Exaggerate',
    'Animated Articulation',
    'Connect with SLP for specific strategies',
  ],
  audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
}

// Resolve the strategies + QR categories for a sound/pattern-key combination,
// falling back to the generic set when the sound/pattern hasn't been
// transcribed from the Sound Strategies document yet.
function resolveGoalSheetContent(sound, patternKey) {
  const entry = getGoalSheetContent()[sound]?.[patternKey]
  if (entry) return entry
  return { qrCategories: [], strategies: GENERIC_FALLBACK_STRATEGIES }
}

// Phase 1: 2/3 syllables, P, B, M, Final P, Final T, Final K, K, G, T, D, S.
// Keys mirror getErrorPatternsLookup()'s pattern/combined-pattern keys exactly
// so the same normalized key used for the pattern/example lookup also works
// here.
function getGoalSheetContent() {
  const syllableStrategies = {
    wordPhrase: ['Clapping', 'Arm Tapping', 'Circles & Dots', 'Beading', 'Stacking'],
    // No dedicated "sound"-level content exists for syllable structure goals -
    // falls back to the word/phrase list per the source document's own note.
    sound: ['Clapping', 'Arm Tapping', 'Circles & Dots', 'Beading', 'Stacking'],
    audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
  }

  return {
    '2 syllables': {
      'Weak Syllable Deletion': { qrCategories: ['Syllables'], strategies: syllableStrategies },
      'Syllable Addition': { qrCategories: ['Syllables'], strategies: syllableStrategies },
    },
    '3 syllables': {
      'Weak Syllable Deletion': { qrCategories: ['Syllables'], strategies: syllableStrategies },
      'Syllable Addition': { qrCategories: ['Syllables'], strategies: syllableStrategies },
    },
    P: {
      Other: {
        qrCategories: ['P/B', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Puff of Air (On Hand)',
            'Mirror',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Puff of Air (On Hand)',
            'Mirror',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['P/B', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Air Puff (on Hand)',
            'Mirror',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Puff of Air (On Hand)',
            'Mirror',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Omission: {
        // Two distinct videos on purpose - general initial-consonant-deletion
        // technique plus P/B-specific placement work.
        qrCategories: ['Initial Consonant Deletion', 'P/B', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Two Tokens',
            'Air Puff (on Hand)',
            'Mirror',
            'Emphasize & Exaggerate',
            'Animated Articulation',
          ],
          sound: ['Puff of Air (On Hand)', 'Mirror', 'Emphasize & Exaggerate', 'Animated Articulation'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    B: {
      Other: {
        qrCategories: ['P/B', 'Animated B'],
        strategies: {
          wordPhrase: [
            'Air Puff (on Hand)',
            'Mirror',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for specific strategies',
          ],
          sound: ['Puff of Air (On Hand)', 'Mirror', 'Emphasize & Exaggerate', 'Animated Articulation'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['P/B', 'Animated B'],
        strategies: {
          wordPhrase: [
            'Puff of Air (On Hand)',
            'Mirror',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Puff of Air (On Hand)',
            'Mirror',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Omission: {
        qrCategories: ['Initial Consonant Deletion', 'P/B', 'Animated B'],
        strategies: {
          wordPhrase: [
            'Two Tokens',
            'Air Puff (on Hand)',
            'Mirror',
            'Emphasize & Exaggerate',
            'Animated Articulation',
          ],
          sound: ['Puff of Air (On Hand)', 'Mirror', 'Emphasize & Exaggerate', 'Animated Articulation'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    M: {
      Other: {
        qrCategories: ['M', 'Animated M'],
        strategies: {
          wordPhrase: [
            'Mirror',
            'Humming',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Contact SLP for student specific strategies',
          ],
          sound: [
            'Mirror',
            'Humming',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Contact SLP for student specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Omission: {
        qrCategories: ['M', 'Initial Consonant Deletion', 'Animated M'],
        strategies: {
          wordPhrase: ['Two Tokens', 'Air Puff (on Hand)', 'Mirror', 'Adult Model', 'Emphasize & Exaggerate', 'Animated Articulation'],
          sound: [
            'Mirror',
            'Humming',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Contact SLP for student specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    'Final P': {
      // "Any" in the source document - the only variant shown is final
      // consonant deletion, which corresponds to the app's Omission pattern.
      Omission: {
        qrCategories: ['Final Consonant Deletion', 'Animated P'],
        strategies: {
          wordPhrase: ['Drag & Dot', 'Two Tokens', 'Air Puff (on Hand)', 'Mirror', 'Adult Model', 'Emphasize and Exaggerate'],
          sound: ['Air Puff (on Hand)', 'Mirror', 'Adult Model', 'Emphasize and Exaggerate'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['P/B', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Contact SLP for student specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Contact SLP for student specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['P/B', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Contact SLP for student specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Contact SLP for student specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    'Final T': {
      Omission: {
        qrCategories: ['Final Consonant Deletion', 'Animated T'],
        strategies: {
          wordPhrase: ['Adult Model', 'Drag & Dot', 'Two Tokens', 'Emphasize and Exaggerate', 'Animated Articulation'],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Contact SLP for student specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Backing: {
        qrCategories: ['T/D', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (Final K & T)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation (T and K for comparison)',
          ],
          sound: [
            'Minimal Pairs (Final K & T)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation (T and K for comparison)',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['T/D', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Contact SLP for student-specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Contact SLP for student-specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['T/D', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Contact SLP for student-specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Contact SLP for student-specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    'Final K': {
      Omission: {
        qrCategories: ['Final Consonant Deletion', 'Animated K'],
        strategies: {
          wordPhrase: ['Drag & Dot', 'Two Tokens', 'Adult Model', 'Emphasize and Exaggerate', 'Animated Articulation'],
          sound: ['Adult Model', 'Emphasize & Exaggerate', 'Animated Articulation'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Fronting: {
        qrCategories: ['K/G', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (Final K & Final T)',
            'Open Mouth K',
            'Animated Articulation (K compared to T)',
            'Tilt Head Back',
            'Emphasize & Exaggerate',
          ],
          sound: [
            'Minimal Pairs (Final K & Final T)',
            'Open Mouth K',
            'Animated Articulation (K compared to T)',
            'Tilt Head Back',
            'Emphasize & Exaggerate',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['K/G', 'Animated K'],
        strategies: {
          wordPhrase: ['Animated Articulation', 'Emphasize & Exaggerate', 'Adult Model', 'Connect with SLP for specific strategies'],
          sound: ['Animated Articulation', 'Emphasize & Exaggerate', 'Adult Model', 'Connect with SLP for specific strategies'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['K/G', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    K: {
      Fronting: {
        qrCategories: ['K/G', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (K & T)',
            'Wide Open Mouth-K',
            'Tip Head Backwards',
            'Adult Model',
            'Emphasize & Exaggerate K',
            'Visual Phonics (pointing to throat)',
            'Animated Articulation: compare K/T',
          ],
          sound: [
            'Wide Open Mouth-K',
            'Tip Head Backwards',
            'Adult Model',
            'Emphasize & Exaggerate K',
            'Animated Articulation: compare K/T',
            'Visual Phonics (pointing to throat)',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Omission: {
        qrCategories: ['Initial Consonant Deletion', 'K/G', 'Animated K'],
        strategies: {
          wordPhrase: [
            "Two Tokens (“c” + “at”)",
            'Emphasize and Exaggerate K',
            'Visual Phonics (pointing to throat)',
            'Animated Articulation: K',
          ],
          sound: [
            "Two Tokens (“c” + “at”)",
            'Emphasize and Exaggerate K',
            'Visual Phonics (pointing to throat)',
            'Animated Articulation: K',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['K/G', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: K',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: K',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['K/G', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: K',
            'Connect with SLP for strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: K',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    G: {
      Fronting: {
        qrCategories: ['K/G', 'Animated G'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (G & D)',
            'Wide Open Mouth-G',
            'Tip Head Backwards',
            'Adult Model',
            'Emphasize & Exaggerate G',
            'Visual Phonics (pointing to throat)',
            'Animated Articulation: compare G/D',
          ],
          sound: [
            'Wide Open Mouth-G',
            'Tip Head Backwards',
            'Adult Model',
            'Emphasize & Exaggerate G',
            'Animated Articulation: compare G/D',
            'Visual Phonics (pointing to throat)',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Omission: {
        qrCategories: ['Initial Consonant Deletion', 'K/G', 'Animated G'],
        strategies: {
          wordPhrase: [
            "Two Tokens (“g” + “as”)",
            'Emphasize and Exaggerate G',
            'Visual Phonics (pointing to throat)',
          ],
          sound: [
            "Two Tokens (“g” + “as”)",
            'Emphasize and Exaggerate G',
            'Visual Phonics (pointing to throat)',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['K/G', 'Animated G'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['K/G', 'Animated G'],
        strategies: {
          wordPhrase: ['Adult Model', 'Emphasize & Exaggerate', 'Animated Articulation: G', 'Connect with SLP for strategies'],
          sound: ['Adult Model', 'Emphasize & Exaggerate', 'Animated Articulation: G', 'Connect with SLP for strategies'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    T: {
      Backing: {
        qrCategories: ['T/D', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (T & K)',
            'Animated Articulation: compare T/D',
            'Instruct tongue to stay up front behind top teeth',
            'Emphasize and Exaggerate T',
          ],
          sound: [
            'Animated Articulation: compare T/D',
            'Adult Model',
            'Emphasize and Exaggerate T',
            'Instruct tongue to stay up front behind top teeth',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Omission: {
        qrCategories: ['Initial Consonant Deletion', 'T/D', 'Animated T'],
        strategies: {
          wordPhrase: [
            "Two Tokens (“t” + “ap”)",
            'Emphasize and Exaggerate T',
            'Visual Phonics',
            'Animated Articulation: T',
          ],
          sound: ['Emphasize and Exaggerate T', 'Visual Phonics', 'Animated Articulation: T'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['T/D', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: T',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: T',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['T/D', 'Animated T'],
        strategies: {
          wordPhrase: ['Adult Model', 'Emphasize & Exaggerate', 'Connect with SLP for strategies'],
          sound: ['Adult Model', 'Emphasize & Exaggerate', 'Connect with SLP for strategies'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    D: {
      Backing: {
        qrCategories: ['T/D', 'Animated D'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (D & G)',
            'Animated Articulation: compare D/G',
            'Instruct tongue to stay at the front behind top teeth',
            'Emphasize and Exaggerate D',
            'Visual Phonics',
          ],
          sound: [
            'Animated Articulation: compare D/G',
            'Instruct tongue to stay at the front behind top teeth',
            'Visual Phonics',
            'Emphasize and Exaggerate D',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Omission: {
        qrCategories: ['Initial Consonant Deletion', 'T/D', 'Animated D'],
        strategies: {
          wordPhrase: [
            "Two Tokens (“d” + “og”)",
            'Emphasize and Exaggerate D',
            'Visual Phonics',
            'Animated Articulation: D',
          ],
          sound: ['Emphasize and Exaggerate D', 'Visual Phonics', 'Animated Articulation: D'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['T/D', 'Animated D'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['T/D', 'Animated D'],
        strategies: {
          wordPhrase: ['Adult Model', 'Emphasize & Exaggerate', 'Connect with SLP for strategies'],
          sound: ['Adult Model', 'Emphasize & Exaggerate', 'Connect with SLP for strategies'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    S: {
      'Stopping T': {
        qrCategories: ['S/Z', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (S & T)',
            'Animated Articulation: compare S & T',
            'Stretchy T (t-t-t-tssss)',
            'Visual Phonics',
          ],
          sound: [
            'Animated Articulation: compare S & T',
            'Stretchy T (t-t-t-tssss)',
            'Visual Phonics',
            'Emphasize and Exaggerate S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Mirror',
            'Snake in the Cage',
            'Minimal Pairs (S & TH)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: compare S & TH',
          ],
          sound: [
            'Mirror',
            'Snake in the Cage',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: compare S & TH',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating', 'Compare air flowing through sides of mouth vs down the center'],
        },
      },
      Omission: {
        qrCategories: ['Initial Consonant Deletion', 'S/Z', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Two Tokens (Sun = s + un)',
            'Emphasize and Exaggerate S',
            'Visual Phonics',
            'Animated Articulation: S',
          ],
          sound: ['Emphasize and Exaggerate S', 'Visual Phonics', 'Animated Articulation: S'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['S/Z', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['S/Z', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Connect with SLP for specific strategies',
          ],
          sound: ['Adult Model', 'Emphasize & Exaggerate', 'Connect with SLP for strategies'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Stopping: {
        qrCategories: ['S/Z', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Animated Articulation: S',
            'Stretchy T (t-t-t)',
            'Visual Phonics',
            'Emphasize and Exaggerate S',
          ],
          sound: [
            'Animated Articulation: S',
            'Stretchy T (t-t-t)',
            'Visual Phonics',
            'Emphasize and Exaggerate S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    // Phase 2: initial S-blends (St-, Sp-, Sm-, Sn-, Sk-) and final S-blends
    // (Final -ts, -ps, -ks). "Omits S and Nasalization"/"Omits <consonant> and
    // Nasalization" combos aren't detailed in the source document for any of
    // these blends and fall back to GENERIC_FALLBACK_STRATEGIES, same as any
    // other untranscribed combo.
    'St-': {
      'Omits S': {
        qrCategories: ['Initial S Blends', 'S/Z', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Arm Slide',
            'Two Tokens: 1 for S, 1 for rest of word (stop = S + top)',
            'Drag and Dot',
            'Minimal Pairs (ST & T)',
            'Stretchy T (t-t-t-tsss)',
            'Emphasize & Exaggerate',
          ],
          sound: [
            'Animated Articulation: S',
            'Emphasize & Exaggerate',
            'Adult Model',
            'Arm Slide',
            'Two Tokens: 1 for S, 1 for T',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits T': {
        qrCategories: ['Initial S Blends', 'T/D', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Arm Slide (emphasizing tapping the hand while saying T)',
            'Adult Model',
            'Exaggerate the T in the word',
            'Animated Articulation: T',
          ],
          sound: ['Animated Articulation: T', 'Emphasize & Exaggerate', 'Adult Model'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits ST': {
        qrCategories: ['Initial S Blends', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Arm Slide',
            'Drag and Dot',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
          ],
          sound: [
            'Animated Articulation: S & T',
            'Emphasize & Exaggerate',
            'Adult Model',
            'Arm Slide',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Backing: {
        qrCategories: ['T/D', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (ST & SK)',
            'Arm Slide (emphasis on tapping the hand while saying T)',
            'Animated Articulation (T and K for comparison)',
          ],
          sound: [
            'Arm Slide (emphasis on tapping the hand while saying T)',
            'Animated Articulation (T and K for comparison)',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits S and Backing': {
        qrCategories: ['Initial S Blends', 'T/D', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (ST & SK)',
            'Arm Slide',
            'Drag and Dot',
            'Adult Model',
            'Animated Articulation: S & T',
          ],
          sound: ['Arm Slide', 'Drag and Dot', 'Adult Model', 'Animated Articulation: S & T'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          sound: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'ST-words (e.g., stop, stand, stem)',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'ST-words (stop, stand, stem)',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      'Omits T and Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Initial S Blends', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
          ],
          sound: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits T and Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Initial S Blends', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      'Frontal Lisp and Backing': {
        qrCategories: ['Frontal Lisp', 'T/D', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
            'Instructions: tip of tongue behind upper teeth for T',
          ],
          sound: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S and compare T/K',
            'Instructions: tip of tongue behind upper teeth for T',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp and Backing': {
        qrCategories: ['Lateral Lisp', 'T/D', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'ST-words (e.g., stop, stand, stem)',
            'Adult Model',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S and compare T/K',
            'Instructions: tip of tongue behind upper teeth for T',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Animated Articulation: S and compare T/K',
            'Instructions: tip of tongue behind upper teeth for T',
            'Compare air flowing through sides of mouth vs down the center',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      Nasalization: {
        qrCategories: ['S/Z', 'T/D', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['S/Z', 'Initial S Blends', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits S and Nasalization': {
        qrCategories: ['Initial S Blends', 'S/Z', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits T and Nasalization': {
        qrCategories: ['Initial S Blends', 'S/Z', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    'Sp-': {
      'Omits S': {
        qrCategories: ['Initial S Blends', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Arm Slide',
            'Two Tokens: 1 for S, 1 for rest of word (Spot = S + Pot)',
            'Drag and Dot',
            'Minimal Pairs (SP & without P)',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & P',
          ],
          sound: [
            'Arm Slide',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & P',
            'Two Tokens: 1 for S, 1 for P',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits P': {
        qrCategories: ['Initial S Blends', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Air Puff (on hand)',
            'Adult model',
            'Emphasize & exaggerate the P in words',
            'Animated Articulation: P',
          ],
          sound: [
            'Air Puff (on hand)',
            'Adult model',
            'Emphasize & exaggerate the P in words',
            'Animated Articulation: P',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits SP': {
        qrCategories: ['Initial S Blends', 'Animated S', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Arm Slide',
            'Drag and Dot',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & P',
          ],
          sound: [
            'Arm Slide',
            'Drag and Dot',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & P',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Mirror (Snake in the Cage)',
            'Stretchy T (t-t-t-tsss)',
            'Keep jaw closed (teeth touching)',
            'Adult Model',
            'Animated Articulation: S',
          ],
          sound: [
            'Mirror (Snake in the Cage)',
            'Stretchy T (t-t-t-tsss)',
            'Keep jaw closed (teeth touching)',
            'Adult Model',
            'Animated Articulation: S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      'Omits P and Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Initial S Blends', 'Animated S', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Mirror (Snake in the Cage)',
            'Stretchy T (t-t-t-tsss)',
            'Keep jaw closed (teeth touching)',
            'Arm Slide',
            'Emphasize & exaggerate the P in words',
            'Animated Articulation: S & P',
          ],
          sound: [
            'Mirror (Snake in the Cage)',
            'Stretchy T (t-t-t-tsss)',
            'Arm Slide',
            'Adult model',
            'Animated Articulation: S & P',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
          ],
        },
      },
      'Omits P and Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Initial S Blends', 'Animated S', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S & P',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S & P',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      Nasalization: {
        qrCategories: ['S/Z', 'Initial S Blends', 'Animated S', 'Animated P'],
        strategies: {
          wordPhrase: ['Adult Model', 'Emphasize & Exaggerate', 'Connect with SLP for strategies'],
          sound: ['Adult Model', 'Emphasize & Exaggerate', 'Connect with SLP for strategies'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['S/Z', 'Initial S Blends', 'Animated S', 'Animated P'],
        strategies: {
          wordPhrase: ['Adult Model', 'Emphasize & Exaggerate', 'Connect with SLP for strategies'],
          sound: ['Adult Model', 'Emphasize & Exaggerate', 'Connect with SLP for strategies'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits S and Nasalization': {
        qrCategories: ['Initial S Blends', 'S/Z', 'Animated S', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & P',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & P',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits P and Nasalization': {
        qrCategories: ['Initial S Blends', 'S/Z', 'Animated S', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & P',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & P',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    'Sm-': {
      'Omits S': {
        qrCategories: ['Initial S Blends', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Arm Slide',
            'Two Tokens: 1 for S, 1 for rest of word (e.g., Smile = S + Mile)',
            'Drag and Dot',
            'Minimal Pairs (SM & M)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          sound: [
            'Animated Articulation: S',
            'Emphasize & Exaggerate',
            'Adult Model',
            'Arm Slide',
            'Two Tokens: 1 for S, 1 for M',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits M': {
        qrCategories: ['Initial S Blends', 'Animated M'],
        strategies: {
          wordPhrase: ['Arm Slide', 'Drag and Dot', 'Adult Model - emphasizing the M'],
          sound: ['Arm Slide', 'Drag and Dot', 'Adult Model - emphasizing the M'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits SM': {
        qrCategories: ['Initial S Blends', 'Animated S', 'Animated M'],
        strategies: {
          wordPhrase: [
            'Arm Slide',
            'Drag and Dot',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & M',
          ],
          sound: [
            'Arm Slide',
            'Drag and Dot',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & M',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          sound: [
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
            'Compare air flowing through sides of mouth vs down the center',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      'Omits M and Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Initial S Blends', 'Animated S', 'Animated M'],
        strategies: {
          wordPhrase: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Arm Slide',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & M',
          ],
          sound: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Arm Slide',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & M',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits M and Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Initial S Blends', 'Animated S', 'Animated M'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Arm Slide',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S & M',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Arm Slide',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S & M',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['S/Z', 'Initial S Blends', 'Animated S', 'Animated M'],
        strategies: {
          wordPhrase: ['Adult Model', 'Emphasize & Exaggerate', 'Animated Articulation'],
          sound: ['Adult Model', 'Emphasize & Exaggerate', 'Animated Articulation'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['S/Z', 'Initial S Blends', 'Animated S', 'Animated M'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits S and Nasalization': {
        qrCategories: ['Initial S Blends', 'S/Z', 'Animated S', 'Animated M'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & M',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & M',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits M and Nasalization': {
        qrCategories: ['Initial S Blends', 'S/Z', 'Animated S', 'Animated M'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & M',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & M',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    'Sn-': {
      'Omits S': {
        qrCategories: ['Initial S Blends', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Arm Slide',
            'Drag and Dot',
            'Minimal Pairs (SN & N)',
            'Two Tokens: 1 for S, 1 for rest of word (Snail = S + Nail)',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          sound: [
            'Arm Slide',
            'Drag and Dot',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
            'Two Tokens: 1 for S, 1 for N',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits N': {
        qrCategories: ['Initial S Blends', 'Animated N'],
        strategies: {
          wordPhrase: [
            'Arm Slide',
            'Drag and Dot',
            'Adult Model',
            'Emphasize & Exaggerate the N',
            'Animated Articulation: N',
          ],
          sound: [
            'Arm Slide',
            'Drag and Dot',
            'Adult Model',
            'Emphasize & Exaggerate the N',
            'Animated Articulation: N',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits SN': {
        qrCategories: ['Initial S Blends', 'Animated S', 'Animated N'],
        strategies: {
          wordPhrase: [
            'Arm Slide',
            'Drag and Dot',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & N',
          ],
          sound: [
            'Arm Slide',
            'Drag and Dot',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & N',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          sound: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      'Omits N and Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Initial S Blends', 'Animated S', 'Animated N'],
        strategies: {
          wordPhrase: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & N',
          ],
          sound: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & N',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits N and Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Initial S Blends', 'Animated S', 'Animated N'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & N',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & N',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      Nasalization: {
        qrCategories: ['S/Z', 'Initial S Blends', 'Animated S', 'Animated N'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['S/Z', 'Initial S Blends', 'Animated S', 'Animated N'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits S and Nasalization': {
        qrCategories: ['Initial S Blends', 'S/Z', 'Animated S', 'Animated N'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & N',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & N',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits N and Nasalization': {
        qrCategories: ['Initial S Blends', 'S/Z', 'Animated S', 'Animated N'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & N',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & N',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    'Sk-': {
      'Omits S': {
        qrCategories: ['Initial S Blends', 'S/Z', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Arm Slide',
            'Drag and Dot',
            'Minimal Pairs (SK & K)',
            'Two Tokens: 1 for S, 1 for rest of word (Sky = S + Ky)',
            'Emphasize & Exaggerate S',
            'Animated Articulation: S',
          ],
          sound: ['Arm Slide', 'Drag and Dot', 'Adult Model', 'Emphasize & Exaggerate', 'Animated Articulation: S'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits K': {
        qrCategories: ['Initial S Blends', 'K/G', 'Animated K'],
        strategies: {
          wordPhrase: ['Arm Slide', 'Drag & Dot', 'Adult Model', 'Emphasize K', 'Animated Articulation: K'],
          sound: ['Arm Slide', 'Drag & Dot', 'Adult Model', 'Emphasize K', 'Animated Articulation: K'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits SK': {
        qrCategories: ['Initial S Blends', 'Animated S', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Arm Slide',
            'Drag and Dot',
            'Minimal Pairs (with & without S)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & K',
          ],
          sound: [
            'Arm Slide',
            'Drag and Dot',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & K',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Fronting: {
        qrCategories: ['K/G', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (K & T)',
            'Tip Head Backwards',
            'Arm Slide (tapping hand while saying K)',
            'Adult Model',
            'Emphasize and Exaggerate the K',
            'Animated Articulation: compare K/T',
          ],
          sound: [
            'Arm Slide (tapping hand while saying K)',
            'Emphasize and Exaggerate the K',
            'Animated Articulation: compare K/T',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits S and Fronting': {
        qrCategories: ['Initial S Blends', 'K/G', 'Animated S', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Wide Open Mouth',
            'Minimal Pairs (for T substitutions)',
            'Tip Head Backwards',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & compare K/T',
          ],
          sound: [
            'Wide Open Mouth',
            'Tip Head Backwards',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S and compare K/T',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Animated Articulation: S',
          ],
          sound: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Animated Articulation: S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits K and Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Initial S Blends', 'Animated S', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Arm Slide',
            'Drag and Dot',
            'Animated Articulation: S & K',
          ],
          sound: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Arm Slide',
            'Drag and Dot',
            'Adult Model',
            'Animated Articulation: S & K',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits K and Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Initial S Blends', 'Animated S', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & K',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Arm Slide',
            'Drag & Dot',
            'Animated Articulation: S & K',
            'Compare air flowing through sides of mouth vs down the center',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Frontal Lisp and Fronting': {
        qrCategories: ['Frontal Lisp', 'K/G', 'Animated S', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Mirror (Snake in the Cage)',
            'Teeth Touching',
            'Stretchy T (t-t-t-tsss)',
            'Arm Slide',
            'Drag and Dot',
            'Wide open mouth (for K)',
            'Tip head back (for K)',
            'Animated Articulation: S & comparing K/T',
          ],
          sound: [
            'Mirror (Snake in the Cage)',
            'Teeth Touching',
            'Stretchy T (t-t-t-tsss)',
            'Arm Slide',
            'Drag and Dot',
            'Wide open mouth (for K)',
            'Tip head back (for K)',
            'Animated Articulation: S & comparing K/T',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp and Fronting': {
        qrCategories: ['Lateral Lisp', 'K/G', 'Animated S', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Wide open mouth (for K)',
            'Tip Head Back (for K)',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S & compare K/T',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Wide open mouth (for K)',
            'Tip Head Back (for K)',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S & compare K/T',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      Nasalization: {
        qrCategories: ['S/Z', 'K/G', 'Animated S', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['S/Z', 'Initial S Blends', 'Animated S', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    'Final -ts': {
      'Omits S': {
        qrCategories: ['Final S Blends', 'S/Z', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Finger S-Drag',
            'Dot and Drag (marker)',
            'Minimal Pairs (TS & T)',
            'Teaching Plurals',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          sound: ['Finger S-Drag', 'Dot and Drag (marker)', 'Emphasize & Exaggerate'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits T': {
        qrCategories: ['Final S Blends', 'T/D', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Emphasize and exaggerate (T)',
            'Dot and Drag (Dot for T, Drag for S)',
            'Animated Articulation: T',
          ],
          sound: [
            'Emphasize and exaggerate (T)',
            'Dot and Drag (Dot for T, Drag for S)',
            'Animated Articulation: T',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits TS': {
        qrCategories: ['Final S Blends', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Dot & Drag',
            'S-Drag',
            'Minimal Pairs (TS & T)',
            'Teaching Plurals',
            'Emphasize & Exaggerate',
            'Animated Articulation: T & S',
          ],
          sound: [
            'Dot & Drag (marker)',
            'Finger S-Drag',
            'Emphasize & Exaggerate',
            'Animated Articulation: T & S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Backing: {
        qrCategories: ['T/D', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Instructions: tip of tongue behind upper teeth for T',
            'Emphasize and Exaggerate',
            'Animated Articulation: compare T/K',
          ],
          sound: [
            'Instructions: tip of tongue behind upper teeth for T',
            'Emphasize and Exaggerate',
            'Animated Articulation: compare T/K',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits S and Backing': {
        qrCategories: ['Final S Blends', 'T/D', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Animated Articulation: S and compare T/K',
            'Instructions: tip of tongue behind upper teeth for T',
            'Emphasize and Exaggerate',
            'Dot and Drag',
          ],
          sound: [
            'Animated Articulation: S and compare T/K',
            'Instructions: tip of tongue behind upper teeth for T',
            'Emphasize and Exaggerate',
            'Dot and Drag',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          sound: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Animated Articulation: S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Emphasize & Exaggerate',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      'Omits T and Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Final S Blends', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Mirror (Snake in the Cage)',
            'Keep jaw closed (teeth touching)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: T & S',
          ],
          sound: [
            'Mirror (Snake in the Cage)',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Animated Articulation: T & S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits T and Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Final S Blends', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Dot & Drag',
            'Compare air flowing through sides of mouth vs down the center',
          ],
          sound: [
            'Straw Microphone',
            'Stretchy T (t-t-t-tsss)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Dot & Drag',
            'Animated Articulation: S & T',
            'Compare air flowing through sides of mouth vs down the center',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      Nasalization: {
        qrCategories: ['Final S Blends', 'S/Z', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & T',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['S/Z', 'Final S Blends', 'Animated S', 'Animated T'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Connect with SLP for strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    'Final -ps': {
      'Omits S': {
        qrCategories: ['Final S Blends', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Finger S-Drag',
            'Dot and Drag (marker)',
            'Minimal Pairs (PS & P)',
            'Teaching Plurals',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          sound: [
            'Finger S-Drag',
            'Dot and Drag (marker)',
            'Minimal Pairs (PS & P)',
            'Teaching Plurals',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits P': {
        qrCategories: ['Final S Blends', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Emphasize and exaggerate (P)',
            'Dot and Drag (Dot for P, Drag for S)',
            'Animated Articulation: P',
          ],
          sound: [
            'Emphasize and exaggerate (P)',
            'Dot and Drag (Dot for P, Drag for S)',
            'Animated Articulation: P',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits PS': {
        qrCategories: ['Final S Blends', 'Animated S', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Finger S-Drag',
            'Dot and Drag (marker)',
            'Minimal Pairs (PS & P)',
            'Teaching Plurals',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: P & S',
          ],
          sound: [
            'Finger S-Drag',
            'Dot and Drag (marker)',
            'Minimal Pairs (PS & P)',
            'Teaching Plurals',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: P & S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Animated S'],
        strategies: {
          wordPhrase: ['Mirror (Snake in the Cage)', 'Adult Model', 'Emphasize & Exaggerate', 'Animated Articulation: S'],
          sound: ['Stretchy T (t-t-t-tsss)', 'Adult Model', 'Emphasize & Exaggerate', 'Animated Articulation: S'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          sound: [
            'Straw Microphone',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits P and Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Final S Blends', 'Animated S', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Mirror',
            'Snake in the Cage',
            'Keep jaw closed (teeth touching)',
            'Dot & Drag (Dot for P, Drag for S)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & P',
          ],
          sound: [
            'Mirror',
            'Snake in the Cage',
            'Dot & Drag (Dot for P, Drag for S)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & P',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits P and Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Final S Blends', 'Animated S', 'Animated P'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Dot & Drag (Dot for P, Drag for S)',
            'Animated Articulation: S',
          ],
          sound: [
            'Dot & Drag (Dot for P, Drag for S)',
            'Straw Microphone',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Animated Articulation',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      Nasalization: {
        qrCategories: ['S/Z', 'P/B', 'Animated S', 'Animated P'],
        strategies: {
          wordPhrase: ['Adult Model', 'Emphasize & Exaggerate', 'Connect with SLP for specific strategies'],
          sound: ['Adult Model', 'Emphasize & Exaggerate', 'Animated Articulation', 'Connect with SLP for strategies'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['S/Z', 'Final S Blends', 'Animated S', 'Animated P'],
        strategies: {
          wordPhrase: ['Adult Model', 'Emphasize & Exaggerate', 'Connect with SLP for strategies'],
          sound: ['Adult Model', 'Emphasize & Exaggerate', 'Connect with SLP for strategies'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    'Final -ks': {
      'Omits S': {
        qrCategories: ['Final S Blends', 'S/Z', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Finger S-Drag',
            'Dot and Drag (marker)',
            'Minimal Pairs (KS & K)',
            'Teaching Plurals',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          sound: [
            'Finger S-Drag',
            'Dot and Drag (marker)',
            'Minimal Pairs (KS & K)',
            'Teaching Plurals',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits K': {
        qrCategories: ['Final S Blends', 'K/G', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Emphasize and exaggerate (K)',
            'Dot and Drag (Dot for K, Drag for S)',
            'Animated Articulation: K',
          ],
          sound: [
            'Emphasize and exaggerate (K)',
            'Dot and Drag (Dot for K, Drag for S)',
            'Animated Articulation: K',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits KS': {
        qrCategories: ['Final S Blends', 'Animated S', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Finger S-Drag',
            'Dot and Drag (Dot for K, Drag for S)',
            'Animated Articulation: K',
            'Dot and Drag (marker)',
            'Minimal Pairs (KS & S)',
            'Teaching Plurals',
            'Adult Model',
            'Animated Articulation: K & S',
          ],
          sound: [
            'Finger S-Drag',
            'Dot and Drag (Dot for K, Drag for S)',
            'Animated Articulation: K',
            'Dot and Drag (marker)',
            'Minimal Pairs (KS & S)',
            'Teaching Plurals',
            'Adult Model',
            'Animated Articulation: K & S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Fronting: {
        qrCategories: ['K/G', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Animated Articulation: compare K/T',
            'Dot & Drag (Dot for K, Drag for S)',
            'Emphasize and Exaggerate K',
          ],
          sound: [
            'Animated Articulation: compare K/T',
            'Dot & Drag (Dot for K, Drag for S)',
            'Emphasize and Exaggerate K',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits S and Fronting': {
        qrCategories: ['Final S Blends', 'K/G', 'Animated S', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Animated Articulation: S & compare K/T',
            'Dot & Drag (Dot for K, Drag for S)',
            'Finger S-Drag',
            'Emphasize and Exaggerate K',
          ],
          sound: [
            'Animated Articulation: S & compare K/T',
            'Dot & Drag (Dot for K, Drag for S)',
            'Finger S-Drag',
            'Emphasize and Exaggerate K',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Mirror',
            'Snake in the Cage',
            'Dot & Drag (Dot for K, Drag for S)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          sound: [
            'Mirror',
            'Snake in the Cage',
            'Adult Model',
            'Dot & Drag (Dot for K, Drag for S)',
            'Emphasize & Exaggerate',
            'Animated Articulation: S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Animated S'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Dot & Drag (Dot for K, Drag for S)',
            'Animated Articulation: S',
            'Compare air flowing through sides of mouth vs down the center',
          ],
          sound: [
            'Straw Microphone',
            'Dot & Drag (Dot for K, Drag for S)',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Compare air flowing through sides of mouth vs down the center',
            'Animated Articulation: S',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits K and Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Final S Blends', 'Animated S', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Mirror',
            'Snake in the Cage',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & K',
          ],
          sound: [
            'Mirror',
            'Snake in the Cage',
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & K',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Omits K and Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Final S Blends', 'Animated S', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Compare air flowing through sides of mouth vs down the center',
            'Dot & Drag (Dot for K, Drag for S)',
            'Animated Articulation: S & K',
          ],
          sound: [
            'Straw Microphone',
            'Compare air flowing through sides of mouth vs down the center',
            'Dot & Drag (Dot for K, Drag for S)',
            'Animated Articulation: S & K',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      Nasalization: {
        qrCategories: ['Final S Blends', 'S/Z', 'Animated S', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & K',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: S & K',
            'Connect with SLP for specific strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['S/Z', 'Final S Blends', 'Animated S', 'Animated K'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Connect with SLP for strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    // Phase 3: secondary sounds. For sounds whose "Stopping" row in the
    // source document isn't broken out per substituted consonant (Z, Ch, Sh,
    // J, V), a single generic "Stopping" entry covers every substitution -
    // the lookup chain in pushError() tries the specific "Stopping <letter>"
    // key first, then falls back to this generic "Stopping" key, so one
    // entry is enough. F and th split "Stopping with a P/T" out specifically
    // (matching the source document), so those get both a specific and (for
    // F only, per the source) a generic entry.
    L: {
      'Gliding w': {
        qrCategories: ['L', 'Animated L'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (L & W)',
            'Mirror (avoid rounding lips)',
            'Visual Phonics',
            'Animated Articulation: compare L/W',
          ],
          sound: [
            'Mirror (avoid rounding lips)',
            'Visual Phonics',
            'Animated Articulation: compare L/W',
            'Emphasize and Exaggerate L',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Gliding y': {
        qrCategories: ['L', 'Animated L'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (L & Y)',
            'Mirror (flick tongue down)',
            'Visual Phonics',
            'Animated Articulation: Compare L and Y',
          ],
          sound: [
            'Mirror (flick tongue down)',
            'Visual Phonics',
            'Animated Articulation: compare L & Y',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['L', 'Animated L'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: L',
            'Connect with SLP for strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: L',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Omission: {
        qrCategories: ['L', 'Animated L'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: L',
            'Mirror',
            'Visual Phonics',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: L',
            'Mirror',
            'Visual Phonics',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    R: {
      'Gliding w': {
        qrCategories: ['R', 'Animated R'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (R & W)',
            'Mirror (avoid rounding lips)',
            'Big smile (showing teeth)',
            'Bear Growl (grrr...)',
            'Your ______',
            'Animated Articulation: Compare R/W',
          ],
          sound: [
            'Mirror (avoid rounding lips)',
            'Big smile (showing teeth)',
            'Bear Growl (grrr...)',
            'Animated Articulation: Compare R/W',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Gliding y': {
        qrCategories: ['R', 'Animated R'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (R & Y)',
            'Mirror (avoid rounding lips)',
            'Big smile (showing teeth)',
            'Bear Growl (grrr...)',
            'Your ______',
            'Animated Articulation: Compare R/Y',
          ],
          sound: [
            'Mirror: Big smile (showing teeth)',
            'Bear Growl (grrr...)',
            'Your ______',
            'Animated Articulation: Compare R/Y',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['R', 'Animated R'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: R',
            'Connect with SLP for strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: R',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Omission: {
        qrCategories: ['R', 'Animated R'],
        strategies: {
          wordPhrase: [
            'Mirror (avoid rounding lips)',
            'Big smile (showing teeth)',
            'Bear Growl (“grrr…”)',
            'Your ______',
            'Animated Articulation: R',
          ],
          sound: [
            'Mirror (avoid rounding lips)',
            'Big smile (showing teeth)',
            'Bear Growl (“grrr…”)',
            'Your ______',
            'Animated Articulation: R',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    Z: {
      Stopping: {
        qrCategories: ['S/Z', 'Animated Z'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (Z & D)',
            'Animated Articulation: compare Z & D',
            'Bee Buzz (draw it out: zzzz)',
            'Visual Phonics',
          ],
          sound: [
            'Minimal Pairs (Z & D)',
            'Animated Articulation: compare Z & D',
            'Bee Buzz (draw it out: zzzz)',
            'Visual Phonics',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Sibilant S': {
        qrCategories: ['S/Z', 'Animated Z'],
        strategies: {
          wordPhrase: [
            'Verbal Cue: "Turn the Voicebox On"',
            'Touch throat to feel it vibrate on Z',
            'Emphasize and Exaggerate',
            'Bee Buzz',
          ],
          sound: [
            'Verbal Cue: "Turn the Voicebox On"',
            'Touch throat to feel it vibrate on Z',
            'Emphasize and Exaggerate',
            'Bee Buzz',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Frontal Lisp': {
        qrCategories: ['Frontal Lisp', 'Animated Z'],
        strategies: {
          wordPhrase: [
            'Mirror',
            'Snake in the Cage',
            'Keep jaw closed (teeth touching)',
            'Animated Articulation: Z (show how tongue does not pass through teeth)',
          ],
          sound: [
            'Mirror',
            'Snake in the Cage',
            'Keep jaw closed (teeth touching)',
            'Animated Articulation: Z (show how tongue does not pass through teeth)',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'Animated Z'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Visual Cue: drag finger away from the center of the mouth',
          ],
          sound: [
            'Straw Microphone',
            'Compare air flowing through sides of mouth vs down the center',
            'Emphasize & Exaggerate',
            'Visual Cue: drag finger away from the center of the mouth',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      Omission: {
        qrCategories: ['Initial Consonant Deletion', 'S/Z', 'Animated Z'],
        strategies: {
          wordPhrase: [
            'Two Tokens (Zap = z + ap)',
            'Arm Slide',
            'Drag and Dot',
            'Emphasize and Exaggerate Z',
            'Visual Phonics: Z',
            'Animated Articulation: Z',
          ],
          sound: [
            'Emphasize and Exaggerate Z',
            'Visual Phonics: Z',
            'Animated Articulation: Z',
            'Bee Buzz',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['S/Z', 'Animated Z'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: Z',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: Z',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['S/Z', 'Animated Z'],
        strategies: {
          wordPhrase: ['Adult Model', 'Emphasize & Exaggerate', 'Connect with SLP for specific strategies'],
          sound: ['Adult Model', 'Emphasize & Exaggerate', 'Connect with SLP for strategies'],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    Ch: {
      Stopping: {
        qrCategories: ['CH/J', 'Animated Ch'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (Ch & T)',
            'T + Sh = Ch',
            'Prolong SH while tapping tongue to teeth (shh-ch-ch-ch)',
            'Animated Articulation: compare CH & T',
          ],
          sound: [
            'T + Sh = Ch',
            'Prolong SH while tapping tongue to teeth (shh-ch-ch-ch)',
            'Animated Articulation: compare CH & T',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'CH/J', 'Animated Ch'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Compare air flowing through sides of mouth vs down the center',
            'T + SH = CH (the T centers the tongue and airflow)',
            'Visual Phonics',
          ],
          sound: [
            'Straw Microphone',
            'Compare air flowing through sides of mouth vs down the center',
            'T + SH = CH (the T centers the tongue and airflow)',
            'Visual Phonics',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      Omission: {
        qrCategories: ['Initial Consonant Deletion', 'CH/J', 'Animated Ch'],
        strategies: {
          wordPhrase: [
            'Two Tokens (chop = ch + op)',
            'Emphasize and Exaggerate CH',
            'Visual Phonics: CH',
            'Animated Articulation: CH',
          ],
          sound: [
            'Emphasize and Exaggerate CH',
            'Visual Phonics: CH',
            'Animated Articulation: CH',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['CH/J', 'Animated Ch'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: CH',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: CH',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['CH/J', 'Animated Ch'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: CH',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: CH',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    Sh: {
      Stopping: {
        qrCategories: ['SH/ZH', 'Animated Sh'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (Sh & T)',
            'Whisper: Shhh',
            'Mirror',
            'Animated Articulation: SH vs T',
            'Emphasize and Exaggerate: SH',
          ],
          sound: [
            'Whisper: Shhh',
            'Mirror',
            'Animated Articulation: SH vs T',
            'Emphasize and Exaggerate: SH',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Sibilant S': {
        qrCategories: ['SH/ZH', 'Animated Sh'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (Sh & S)',
            'Whisper: Shhh',
            'Mirror',
            'Animated Articulation: SH vs S',
            '"ee" for tongue placement + rounding lips',
            'Emphasize and Exaggerate: SH',
          ],
          sound: [
            'Whisper: Shhh',
            'Mirror',
            'Animated Articulation: SH vs S',
            '"ee" for tongue placement + rounding lips',
            'Emphasize and Exaggerate: SH',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'SH/ZH', 'Animated Sh'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Compare air flowing through sides of mouth vs down the center',
            '"Tish" - the T centralizes the tongue and airflow',
            'Emphasize & Exaggerate SH',
            'Visual Phonics',
          ],
          sound: [
            'Straw Microphone',
            'Compare air flowing through sides of mouth vs down the center',
            '"Tish" - the T centralizes the tongue and airflow',
            'Emphasize & Exaggerate SH',
            'Visual Phonics',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      Omission: {
        qrCategories: ['Initial Consonant Deletion', 'SH/ZH', 'Animated Sh'],
        strategies: {
          wordPhrase: [
            'Two Tokens (ship = sh + ip)',
            'Drag and Dot',
            'Emphasize and Exaggerate SH',
            'Visual Phonics: SH',
            'Animated Articulation: SH',
          ],
          sound: [
            'Emphasize and Exaggerate SH',
            'Visual Phonics: SH',
            'Animated Articulation: SH',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['SH/ZH', 'Animated Sh'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: SH',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: SH',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['SH/ZH', 'Animated Sh'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: SH',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: SH',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    J: {
      Stopping: {
        qrCategories: ['CH/J', 'Animated J'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (J & D)',
            'Mirror (rounding lips for J)',
            'Animated Articulation: compare J & D',
            'D + Zh = J',
            'Emphasize and Exaggerate: J',
          ],
          sound: [
            'Mirror (rounding lips for J)',
            'Animated Articulation: compare J & D',
            'D + Zh = J',
            'Emphasize and Exaggerate: J',
            'Verbal Cue: "tongue up, lips round, voicebox on, burst of air - J!"',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Lateral Lisp': {
        qrCategories: ['Lateral Lisp', 'CH/J', 'Animated J'],
        strategies: {
          wordPhrase: [
            'Straw Microphone',
            'Compare air flowing through sides of mouth vs down the center',
            '"d-d-j d-d-j" (the d centers the tongue and airflow)',
            'Emphasize & Exaggerate J',
            'Visual Phonics: J',
          ],
          sound: [
            'Straw Microphone',
            'Compare air flowing through sides of mouth vs down the center',
            '"d-d-j d-d-j" (the d centers the tongue and airflow)',
            'Emphasize & Exaggerate J',
            'Visual Phonics: J',
          ],
          audDiscrim: [
            'Adult Model',
            'Emphasizing and Exaggerating',
            'Compare air flowing through sides of mouth vs down the center',
          ],
        },
      },
      Omission: {
        qrCategories: ['Initial Consonant Deletion', 'CH/J', 'Animated J'],
        strategies: {
          wordPhrase: [
            'Two Tokens (jog = j + og)',
            'Emphasize and Exaggerate J',
            'Visual Phonics: J',
            'Animated Articulation: J',
          ],
          sound: [
            'Two Tokens (jog = j + og)',
            'Emphasize and Exaggerate J',
            'Visual Phonics: J',
            'd + zh = j',
            'Animated Articulation: J',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Nasalization: {
        qrCategories: ['CH/J', 'Animated J'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: J',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: J',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['CH/J', 'Animated J'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: J',
            'Connect with SLP for specific strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: J',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    F: {
      'Stopping P': {
        qrCategories: ['F/V', 'Animated F'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (F & P)',
            'Mirror',
            'Bunny Face',
            'Visual Phonics',
            'Animated Articulation: compare F and P',
          ],
          sound: [
            'Mirror',
            'Bunny Face',
            'Visual Phonics',
            'Animated Articulation: compare F and P',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Stopping: {
        qrCategories: ['F/V', 'Animated F'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Mirror',
            'Bunny Face',
            'Visual Phonics',
            'Animated Articulation: F',
            'Connect with SLP for strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Mirror',
            'Bunny Face',
            'Visual Phonics',
            'Animated Articulation: F',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Omission: {
        qrCategories: ['Initial Consonant Deletion', 'F/V', 'Animated F'],
        strategies: {
          wordPhrase: [
            'Two Tokens (fun = f + un)',
            'Emphasize and Exaggerate F',
            'Visual Phonics: F',
            'Mirror',
            'Bunny Face',
            'Visual Phonics',
            'Animated Articulation: F',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Mirror',
            'Bunny Face',
            'Visual Phonics',
            'Animated Articulation: F',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['F/V', 'Animated F'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Mirror',
            'Bunny Face',
            'Visual Phonics',
            'Animated Articulation: F',
            'Connect with SLP for strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Mirror',
            'Bunny Face',
            'Visual Phonics',
            'Animated Articulation: F',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    V: {
      Stopping: {
        qrCategories: ['F/V', 'Animated V'],
        strategies: {
          wordPhrase: [
            'Minimal Pairs (V & B)',
            'Mirror',
            'Bunny Face',
            'Visual Phonics',
            'Animated Articulation: compare V and B',
          ],
          sound: [
            'Mirror',
            'Bunny Face',
            'Visual Phonics',
            'Animated Articulation: compare V and B',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Omission: {
        qrCategories: ['Initial Consonant Deletion', 'F/V', 'Animated V'],
        strategies: {
          wordPhrase: [
            'Two Tokens (van = v + an)',
            'Emphasize and Exaggerate V',
            'Visual Phonics: V',
            'Mirror',
            'Bunny Face',
            'Animated Articulation: V',
          ],
          sound: [
            'Emphasize and Exaggerate V',
            'Visual Phonics: V',
            'Mirror',
            'Bunny Face',
            'Animated Articulation: V',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['F/V', 'Animated V'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: V',
            'Connect with SLP for strategies',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: V',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    '-er': {
      Vowelization: {
        qrCategories: ['Final ER/AR/OR', 'Animated ER'],
        strategies: {
          wordPhrase: [
            'Animated Articulation: ER',
            'Visual Phonics: ER',
            '"Eee" + slide tongue backwards = "ear"',
            'Bear growl "Grrr"',
          ],
          sound: [
            'Start with initial R & shorten it (Rrrrrrr... er)',
            '"Eee" + slide tongue backwards = "ear"',
            'Bear growl "Grrr"',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['Final ER/AR/OR', 'Animated ER'],
        strategies: {
          wordPhrase: [
            'Animated Articulation: ER',
            'Visual Phonics: ER',
            '"Eee" + slide tongue backwards = "ear"',
            'Bear growl "Grrr"',
          ],
          sound: [
            'Start with initial R & shorten it (Rrrrrrr... er)',
            '"Eee" + slide tongue backwards = "ear"',
            'Bear growl "Grrr"',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    '-ar': {
      Vowelization: {
        qrCategories: ['Final ER/AR/OR', 'Animated AR'],
        strategies: {
          wordPhrase: [
            'Mirror (avoid rounding lips)',
            'Pirate Sounds',
            'Animated Articulation: AR',
            'Practice the word car (the initial K sound will keep the tongue back)',
          ],
          sound: [
            'Mirror (avoid rounding lips)',
            'Pirate Sounds',
            'Animated Articulation: AR',
            'Practice the word car (the initial K sound will keep the tongue back)',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Vowelization w': {
        qrCategories: ['Final ER/AR/OR', 'Animated AR'],
        strategies: {
          wordPhrase: [
            'Mirror (avoid rounding lips)',
            'Pirate Sounds',
            'Animated Articulation: AR',
            'Practice the word car (the initial K sound will keep the tongue back)',
          ],
          sound: [
            'Mirror (avoid rounding lips)',
            'Pirate Sounds',
            'Animated Articulation: AR',
            'Practice the word car (the initial K sound will keep the tongue back)',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Vowelization y': {
        qrCategories: ['Final ER/AR/OR', 'Animated AR'],
        strategies: {
          wordPhrase: [
            'Mirror (avoid rounding lips)',
            'Pirate Sounds',
            'Animated Articulation: AR',
            'Practice the word car (the initial K sound will keep the tongue back)',
          ],
          sound: [
            'Mirror (avoid rounding lips)',
            'Pirate Sounds',
            'Animated Articulation: AR',
            'Practice the word car (the initial K sound will keep the tongue back)',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['Final ER/AR/OR', 'Animated AR'],
        strategies: {
          wordPhrase: [
            'Mirror (avoid rounding lips)',
            'Pirate Sounds',
            'Animated Articulation: AR',
            'Practice the word car (the initial K sound will keep the tongue back)',
          ],
          sound: [
            'Mirror (avoid rounding lips)',
            'Pirate Sounds',
            'Animated Articulation: AR',
            'Practice the word car (the initial K sound will keep the tongue back)',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    '-or': {
      Vowelization: {
        qrCategories: ['Final ER/AR/OR'],
        strategies: {
          wordPhrase: [
            'Roar (initial R can sometimes help anchor the tongue)',
            'Open mouth wider (this prevents full rounding of the R and drops the tongue)',
            'Practice the word core (the initial K sound will keep the tongue back)',
            'Animated Articulation: OR',
            'Emphasize and Exaggerate',
          ],
          sound: [
            'Roar (initial R can sometimes help anchor the tongue)',
            'Open mouth wider (this prevents full rounding of the R and drops the tongue)',
            'Slow Slide: O > R "oooo...rrrrr"',
            'Animated Articulation: OR',
            'Emphasize and Exaggerate',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Vowelization oh/w': {
        qrCategories: ['Final ER/AR/OR'],
        strategies: {
          wordPhrase: [
            'Roar (initial R can sometimes help anchor the tongue)',
            'Open mouth wider (this prevents full rounding of the R and drops the tongue)',
            'Practice the word core (the initial K sound will keep the tongue back)',
            'Animated Articulation: OR',
            'Emphasize and Exaggerate',
          ],
          sound: [
            'Roar (initial R can sometimes help anchor the tongue)',
            'Open mouth wider (this prevents full rounding of the R and drops the tongue)',
            'Slow Slide: O > R "oooo...rrrrr"',
            'Animated Articulation: OR',
            'Emphasize and Exaggerate',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Vowelization y': {
        qrCategories: ['Final ER/AR/OR'],
        strategies: {
          wordPhrase: [
            'Roar (initial R can sometimes help anchor the tongue)',
            'Open mouth wider (this prevents full rounding of the R and drops the tongue)',
            'Practice the word core (the initial K sound will keep the tongue back)',
            'Animated Articulation: OR',
            'Emphasize and Exaggerate',
          ],
          sound: [
            'Roar (initial R can sometimes help anchor the tongue)',
            'Open mouth wider (this prevents full rounding of the R and drops the tongue)',
            'Slow Slide: O > R "oooo...rrrrr"',
            'Animated Articulation: OR',
            'Emphasize and Exaggerate',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['Final ER/AR/OR'],
        strategies: {
          wordPhrase: [
            'Roar (initial R can sometimes help anchor the tongue)',
            'Open mouth wider (this prevents full rounding of the R and drops the tongue)',
            'Practice the word core (the initial K sound will keep the tongue back)',
            'Animated Articulation: OR',
            'Emphasize and Exaggerate',
          ],
          sound: [
            'Roar (initial R can sometimes help anchor the tongue)',
            'Open mouth wider (this prevents full rounding of the R and drops the tongue)',
            'Slow Slide: O > R "oooo...rrrrr"',
            'Animated Articulation: OR',
            'Emphasize and Exaggerate',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
    },
    th: {
      'Stopping T': {
        qrCategories: ['TH', 'Animated TH'],
        strategies: {
          wordPhrase: [
            'Mirror (can see tongue between teeth)',
            'Verbal Cue: 1. stick your tongue between your teeth/gently bite your tongue 2. Blow out the air "thhh"',
            'Minimal Pairs: TH & T',
            'Animated Articulation: Compare TH/T',
            'Emphasize and Exaggerate',
          ],
          sound: [
            'Mirror (can see tongue between teeth)',
            'Verbal Cue: 1. stick your tongue between your teeth/gently bite your tongue 2. Blow out the air "thhh"',
            'Minimal Pairs: TH & T',
            'Animated Articulation: Compare TH/T',
            'Emphasize and Exaggerate',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Sibilant Substitution (F)': {
        qrCategories: ['TH', 'Animated TH'],
        strategies: {
          wordPhrase: [
            'Hold the F sound and stick tongue out halfway through "ffff-thhh"',
            'Mirror (can see tongue between teeth)',
            'Verbal Cue: 1. stick your tongue between your teeth/gently bite your tongue 2. Blow out the air "thhh"',
            'Minimal Pairs: TH & F',
            'Animated Articulation: Compare TH/F',
            'Emphasize and Exaggerate',
          ],
          sound: [
            'Hold the F sound and stick tongue out halfway through "ffff-thhh"',
            'Mirror (can see tongue between teeth)',
            'Verbal Cue: 1. stick your tongue between your teeth/gently bite your tongue 2. Blow out the air "thhh"',
            'Animated Articulation: Compare TH/F',
            'Emphasize and Exaggerate',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Sibilant Substitution (S)': {
        qrCategories: ['TH', 'Animated TH'],
        strategies: {
          wordPhrase: [
            'Mirror (can see tongue between teeth)',
            'Verbal Cue: 1. stick your tongue between your teeth/gently bite your tongue 2. Blow out the air "thhh"',
            'Hold the S sound and stick tongue out halfway through "sss-thhh"',
            'Minimal Pairs: TH & S',
            'Animated Articulation: Compare TH/S',
            'Emphasize and Exaggerate',
          ],
          sound: [
            'Mirror (can see tongue between teeth)',
            'Verbal Cue: 1. stick your tongue between your teeth/gently bite your tongue 2. Blow out the air "thhh"',
            'Hold the S sound and stick tongue out halfway through "sss-thhh"',
            'Animated Articulation: Compare TH/S',
            'Emphasize and Exaggerate',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Omission: {
        qrCategories: ['Initial Consonant Deletion', 'TH', 'Animated TH'],
        strategies: {
          wordPhrase: [
            'Two Tokens (thumb = th + umb)',
            'Mirror (can see tongue between teeth)',
            'Verbal Cue: 1. stick your tongue between your teeth/gently bite your tongue 2. Blow out the air "thhh"',
            'Hold the S sound and stick tongue out halfway through "sss-thhh"',
            'Animated Articulation: Compare TH',
          ],
          sound: [
            'Mirror (can see tongue between teeth)',
            'Verbal Cue: 1. stick your tongue between your teeth/gently bite your tongue 2. Blow out the air "thhh"',
            'Hold the S sound and stick tongue out halfway through "sss-thhh"',
            'Animated Articulation: Compare TH',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Other: {
        qrCategories: ['TH', 'Animated TH'],
        strategies: {
          wordPhrase: [
            'Mirror (can see tongue between teeth)',
            'Verbal Cue: 1. stick your tongue between your teeth/gently bite your tongue 2. Blow out the air "thhh"',
            'Animated Articulation: TH',
            'Emphasize & Exaggerate',
            'Connect with SLP for strategies',
          ],
          sound: [
            'Mirror (can see tongue between teeth)',
            'Verbal Cue: 1. stick your tongue between your teeth/gently bite your tongue 2. Blow out the air "thhh"',
            'Animated Articulation: TH',
            'Emphasize & Exaggerate',
            'Connect with SLP for strategies',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      Stopping: {
        qrCategories: ['TH', 'Animated TH'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: TH',
            'Lightly Bite Tongue and Blow',
            'Mirror',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: TH',
            'Lightly Bite Tongue and Blow',
            'Mirror',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
      'Sibilant error (s, f)': {
        qrCategories: ['TH', 'Animated TH'],
        strategies: {
          wordPhrase: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: TH',
            'Lightly Bite Tongue and Blow',
            'Mirror',
          ],
          sound: [
            'Adult Model',
            'Emphasize & Exaggerate',
            'Animated Articulation: TH',
            'Lightly Bite Tongue and Blow',
            'Mirror',
          ],
          audDiscrim: ['Adult Model', 'Emphasizing and Exaggerating'],
        },
      },
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
      'Omits S and Backing': {
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
