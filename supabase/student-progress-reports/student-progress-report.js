// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { AwsClient } from 'npm:aws4fetch@1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.info('Progress report function started')

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
    const { speech_screening_id_1, speech_screening_id_2, override_emails, generated_by, password } =
      await req.json()

    if (!speech_screening_id_1 || !speech_screening_id_2) {
      throw new Error('speech_screening_id_1 and speech_screening_id_2 are required')
    }
    if (speech_screening_id_1 === speech_screening_id_2) {
      throw new Error('speech_screening_id_1 and speech_screening_id_2 must be different screenings')
    }
    if (!password) {
      throw new Error('password is required')
    }

    console.log(
      `Processing progress report comparing screenings: ${speech_screening_id_1}, ${speech_screening_id_2}`,
    )

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // 1. Fetch both screenings with all related data
    const screeningsUrl = `${supabaseUrl}/rest/v1/speech_screenings?id=in.(${speech_screening_id_1},${speech_screening_id_2})&select=*,students(*,schools(*)),school_grades(*)`
    const screeningsResponse = await fetch(screeningsUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!screeningsResponse.ok) {
      throw new Error(`Failed to fetch speech screenings: ${screeningsResponse.status}`)
    }

    const screenings = await screeningsResponse.json()
    if (!screenings || screenings.length !== 2) {
      throw new Error('One or both speech screenings could not be found')
    }

    if (screenings[0].student_id !== screenings[1].student_id) {
      throw new Error('Both screenings must belong to the same student to generate a progress report')
    }

    const isAbsent = s => s.result === 'absent' || s.error_patterns?.attendance?.absent === true
    if (screenings.some(isAbsent)) {
      throw new Error('Cannot generate progress report: one of the selected screenings is marked as absent.')
    }

    // 2. Sort chronologically — earlier screening is "initial", later is "progress"
    const [previousScreening, currentScreening] = [...screenings].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at),
    )

    console.log(
      `Found screening for student: ${currentScreening.students.first_name} ${currentScreening.students.last_name}`,
    )
    console.log(
      `Comparing initial screening (${previousScreening.created_at}) with progress screening (${currentScreening.created_at})`,
    )

    // 3. Process error patterns from both screenings
    const currentErrors = processErrorPatterns(currentScreening.error_patterns || {})
    const previousErrors = processErrorPatterns(previousScreening.error_patterns || {})

    console.log(
      `Current errors: ${currentErrors.length}, Previous errors: ${previousErrors.length}`,
    )

    // 4. Build primary table — one row per (sound, pattern), joined across both screenings
    const primaryTableErrors = buildPrimaryTableErrors(previousErrors, currentErrors)

    console.log(`Primary table rows: ${primaryTableErrors.length}`)

    // 5. Extract student info
    const studentInfo = {
      first_name: currentScreening.students.first_name,
      last_name: currentScreening.students.last_name,
      grade: currentScreening.school_grades?.grade_level || '',
      email: '',
      school: currentScreening.students.schools?.name || '',
    }

    // 6. Determine recipient emails: use override_emails if provided, else fall back to staging table email
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

    // 7. Extract progress_notes from the progress screening
    const progressNotes = currentScreening.progress_notes || ''

    // 8. Format screening dates
    const initialScreenDate = formatDate(previousScreening.created_at)
    const progressScreenDate = formatDate(currentScreening.created_at)

    // 9. Create document object (this becomes the report_data behind the password gate)
    const documentObject = createDocumentObject({ studentInfo, primaryTableErrors, progressNotes, initialScreenDate, progressScreenDate })

    // 10. Create a password-protected report token instead of emailing the PDF directly
    //     (the doc-gen Lambda never returns PDF bytes and always attaches a real PDF
    //     whenever it emails, so it can't be used for a link-only notification)
    const token = await createReportToken({
      supabaseUrl,
      supabaseKey,
      password,
      reportType: 'progress_report',
      reportData: documentObject,
      studentId: currentScreening.student_id,
      schoolId: currentScreening.students.school_id,
      createdBy: generated_by,
    })

    const viewUrl = `${Deno.env.get('APP_BASE_URL')}/view-report/${token}`

    console.log(`Sending secure report link to ${recipientEmails.join(', ')}...`)

    await sendReportLinkEmail({
      recipients: recipientEmails,
      subject: 'NVSS Student Speech Report',
      reportLabel: `${studentInfo.first_name} ${studentInfo.last_name}'s progress report`,
      viewUrl,
    })

    console.log(`Secure report link sent successfully`)

    // 12. Log the generation in reports table
    const reportInsertUrl = `${supabaseUrl}/rest/v1/reports`
    await fetch(reportInsertUrl, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_id: currentScreening.student_id,
        school_id: currentScreening.students.school_id,
        speech_screening_id: currentScreening.id,
        report_type: 'speech_progress_report',
        file_key: `progress_report_${previousScreening.id}_${currentScreening.id}`,
        generated_by: generated_by || null,
        metadata: {
          sent_to: recipientEmails,
          primary_table_count: primaryTableErrors.length,
          progress_notes: progressNotes,
          initial_speech_screening_id: previousScreening.id,
          progress_speech_screening_id: currentScreening.id,
          delivery_method: 'password_protected_link',
          report_token: token,
        },
      }),
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: `Progress report generated and a secure link sent to ${recipientEmails.join(', ')}`,
        student_name: `${studentInfo.first_name} ${studentInfo.last_name}`,
        primary_table_count: primaryTableErrors.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error generating progress report:', error)
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

function getStimulabilityRank(stimulabilityOption) {
  const normalized = (stimulabilityOption || '').toLowerCase().trim()
  if (normalized.includes('phrase')) return 3
  if (normalized.includes('word')) return 2
  if (normalized.includes('sound')) return 1
  if (normalized.includes('non-stimulable') || normalized.includes('non stimulable')) return 0
  return 1
}

function formatStimulability(option) {
  if (!option) return 'Practicing at Sound level'
  const normalized = option.toLowerCase()
  if (normalized.includes('non-stimulable') || normalized.includes('non stimulable')) {
    return 'At the discrimination level'
  }
  return `Practicing at ${option} level`
}

// Merges previous and current errors into one row per (sound, pattern).
// initial_screen and progress_screen come from soundError.stimulabilityOption on each respective screening.
function buildPrimaryTableErrors(previousErrors, currentErrors) {
  const prevMap = new Map()
  for (const e of previousErrors) {
    prevMap.set(`${e.sound}|||${e.pattern}`, e)
  }

  const currMap = new Map()
  for (const e of currentErrors) {
    currMap.set(`${e.sound}|||${e.pattern}`, e)
  }

  const allKeys = new Set([...prevMap.keys(), ...currMap.keys()])

  const merged = []
  for (const key of allKeys) {
    const prev = prevMap.get(key)
    const curr = currMap.get(key)
    const base = curr || prev

    let summary = ''
    if (prev && !curr) {
      summary = 'Successfully resolved. No error noted on latest screening'
    } else if (!prev && curr) {
      summary = 'Continues to require support'
    } else {
      const initialRank = getStimulabilityRank(prev.stimulability_option)
      const progressRank = getStimulabilityRank(curr.stimulability_option)
      if (progressRank > initialRank && initialRank >= 0 && progressRank >= 0) {
        summary = 'Demonstrates measurable progress'
      } else {
        summary = 'Continues to require support'
      }
    }

    merged.push({
      sound: base.sound,
      pattern: base.pattern,
      example: base.example,
      initial_screen: prev ? formatStimulability(prev.stimulability_option) : 'No Error Recorded',
      progress_screen: curr ? formatStimulability(curr.stimulability_option) : 'No Error Recorded',
      summary,
    })
  }

  return sortPhonologicalProcesses(merged)
}

// Helper function to process error patterns from JSONB
function processErrorPatterns(errorPatterns) {
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

  const processedErrors = []
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
    const errorPatterns = (soundError.errorPatterns || []).filter(p => p !== 'Stimulability')
    const otherNotes = soundError.otherNotes?.toLowerCase() || ''
    const stoppingSounds = soundError.stoppingSounds || []
    const stimulabilityOption = (soundError.stimulabilityOptions || []).join(', ')

    // Skip sounds with no error patterns - they shouldn't be included as errors
    if (!Array.isArray(errorPatterns) || errorPatterns.length === 0) {
      continue
    }

    // Handle multiple error patterns for the same sound
    if (Array.isArray(errorPatterns) && errorPatterns.length > 0) {
      // Check if we have multiple error patterns that should be combined
      if (errorPatterns.length > 1) {
        // Try to find a combined pattern in the lookup table
        // Handle case sensitivity and remove all quote characters
        const normalizedPatterns = errorPatterns.map(
          p =>
            p
              .replace(/\(Omits/g, '(omits')
              .replace(/\u201C/g, '') // Remove left smart quote (Unicode 8220)
              .replace(/\u201D/g, '') // Remove right smart quote (Unicode 8221)
              .replace(/"/g, '') // Remove straight quotes
              .replace(/'/g, ''), // Remove single quotes
        )
        const combinedKey = normalizedPatterns.join(' and ')
        let errorInfo = errorPatternsLookup[sound]?.[combinedKey]

        // If not found, try reverse order (since patterns might be in different order)
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
            stimulability_option: stimulabilityOption,
          })
        } else {
          // No combined pattern found, process each pattern individually
          for (const pattern of errorPatterns) {
            // Special handling for "Other" pattern
            if (pattern === 'Other') {
              processedErrors.push({
                sound: sound,
                pattern: `Atypical Substitution`, // Special format for "Other"
                example: otherNotes?.toLowerCase() || 'Error detected', // Use otherNotes for example
                stimulability_option: stimulabilityOption,
              })
            } else {
              // Handle stopping sounds specially for individual patterns
              if (pattern === 'Stopping' && stoppingSounds.length > 0) {
                const stoppingSound = stoppingSounds[0] // Use first stopping sound
                const stoppingKey = `Stopping ${stoppingSound}`

                let errorInfo = errorPatternsLookup[sound]?.[stoppingKey]

                if (errorInfo) {
                  processedErrors.push({
                    sound: sound,
                    pattern: errorInfo.pattern,
                    example: otherNotes?.toLowerCase() || errorInfo.example,
                    stimulability_option: stimulabilityOption,
                  })
                } else {
                  // Fallback to generic stopping if specific stopping sound not found
                  let genericStoppingInfo = errorPatternsLookup[sound]?.[pattern]

                  if (genericStoppingInfo) {
                    processedErrors.push({
                      sound: sound,
                      pattern: genericStoppingInfo.pattern,
                      example: otherNotes?.toLowerCase() || genericStoppingInfo.example,
                      stimulability_option: stimulabilityOption,
                    })
                  } else {
                    // Final fallback
                    processedErrors.push({
                      sound: sound,
                      pattern: pattern,
                      example: otherNotes?.toLowerCase() || 'Error detected',
                      stimulability_option: stimulabilityOption,
                    })
                  }
                }
              } else {
                // Regular pattern matching
                const normalizedPattern = pattern
                  .replace(/\(Omits/g, '(omits')
                  .replace(/\u201C/g, '') // Remove left smart quote
                  .replace(/\u201D/g, '') // Remove right smart quote
                  .replace(/"/g, '') // Remove straight quotes
                  .replace(/'/g, '') // Remove single quotes

                const individualErrorInfo = errorPatternsLookup[sound]?.[normalizedPattern]

                if (individualErrorInfo) {
                  // Use lookup example if otherNotes is empty, otherwise use otherNotes
                  processedErrors.push({
                    sound: sound,
                    pattern: individualErrorInfo.pattern,
                    example: otherNotes?.toLowerCase() || individualErrorInfo.example,
                    stimulability_option: stimulabilityOption,
                  })
                } else {
                  // Fallback if not found in lookup
                  processedErrors.push({
                    sound: sound,
                    pattern: pattern,
                    example: otherNotes?.toLowerCase() || 'Error detected',
                    stimulability_option: stimulabilityOption,
                  })
                }
              }
            }
          }
        }
      } else {
        // Single error pattern
        const pattern = errorPatterns[0]

        // Special handling for "Other" pattern
        if (pattern === 'Other') {
          processedErrors.push({
            sound: sound,
            pattern: `Atypical Substitution`, // Special format for "Other"
            example: otherNotes?.toLowerCase() || 'Error detected', // Use otherNotes for example
            stimulability_option: stimulabilityOption,
          })
        } else {
          // Handle stopping sounds specially
          if (pattern === 'Stopping' && stoppingSounds.length > 0) {
            const stoppingSound = stoppingSounds[0] // Use first stopping sound
            const stoppingKey = `Stopping ${stoppingSound}`

            let errorInfo = errorPatternsLookup[sound]?.[stoppingKey]

            if (errorInfo) {
              processedErrors.push({
                sound: sound,
                pattern: errorInfo.pattern,
                example: otherNotes?.toLowerCase() || errorInfo.example,
                stimulability_option: stimulabilityOption,
              })
            } else {
              // Fallback to generic stopping if specific stopping sound not found
              let genericStoppingInfo = errorPatternsLookup[sound]?.[pattern]

              if (genericStoppingInfo) {
                processedErrors.push({
                  sound: sound,
                  pattern: genericStoppingInfo.pattern,
                  example: otherNotes?.toLowerCase() || genericStoppingInfo.example,
                  stimulability_option: stimulabilityOption,
                })
              } else {
                // Final fallback
                processedErrors.push({
                  sound: sound,
                  pattern: pattern,
                  example: otherNotes?.toLowerCase() || 'Error detected',
                  stimulability_option: stimulabilityOption,
                })
              }
            }
          } else {
            // Regular pattern matching for non-stopping sounds
            // Try to find in lookup table first - try exact match first
            let errorInfo = errorPatternsLookup[sound]?.[pattern]

            if (!errorInfo) {
              // Try normalized match
              const normalizedPattern = pattern
                .replace(/\(Omits/g, '(omits')
                .replace(/\u201C/g, '') // Remove left smart quote
                .replace(/\u201D/g, '') // Remove right smart quote
                .replace(/"/g, '') // Remove straight quotes
                .replace(/'/g, '') // Remove single quotes
                .replace(/\\/g, '') // Remove backslashes

              errorInfo = errorPatternsLookup[sound]?.[normalizedPattern]
            }

            if (errorInfo) {
              // Use lookup example if otherNotes is empty, otherwise use otherNotes
              processedErrors.push({
                sound: sound,
                pattern: errorInfo.pattern,
                example: otherNotes?.toLowerCase() || errorInfo.example,
                stimulability_option: stimulabilityOption,
              })
            } else {
              // Fallback if not found in lookup
              processedErrors.push({
                sound: sound,
                pattern: pattern,
                example: otherNotes?.toLowerCase() || 'Error detected',
                stimulability_option: stimulabilityOption,
              })
            }
          }
        }
      }
    } else {
      // Fallback if no errorPatterns
      processedErrors.push({
        sound: sound,
        pattern: 'Error detected',
        example: otherNotes?.toLowerCase() || 'Error detected',
        stimulability_option: stimulabilityOption,
      })
    }
  }

  return sortPhonologicalProcesses(processedErrors)
}

function sortPhonologicalProcesses(errors) {
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

  let selectedOrder = soundOrder
  if (hasFronting) {
    selectedOrder = frontingSoundOrder
  } else if (hasBacking) {
    selectedOrder = backingSoundOrder
  }

  const sortedSounds = []
  let week = 1

  selectedOrder.forEach(sound => {
    errors.forEach(error => {
      if (error.sound === sound) {
        sortedSounds.push({ ...error, week })
        week++
      }
    })
  })

  // Add any sounds not in the predefined order at the end
  errors.forEach(error => {
    if (!selectedOrder.includes(error.sound)) {
      sortedSounds.push({ ...error, week })
      week++
    }
  })

  return sortedSounds
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function createDocumentObject({ studentInfo, primaryTableErrors, progressNotes, initialScreenDate, progressScreenDate }) {
  return {
    metadata: {
      file_name: `${studentInfo.first_name} ${studentInfo.last_name}: NVSS Progress Report`,
    },
    template: {
      name: 'Student Progress Report',
      version: 1,
    },
    context: {
      student_name: `${studentInfo.first_name} ${studentInfo.last_name}`,
      grade: studentInfo.grade,
      school: studentInfo.school,
      initial_screen_date: initialScreenDate,
      progress_screen_date: progressScreenDate,
      primary_table_errors: primaryTableErrors,
      progress_notes: progressNotes,
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
