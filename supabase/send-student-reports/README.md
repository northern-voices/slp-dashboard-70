# Send Student Reports

## Files

- `send-student-report.ts` — Generates and emails a speech screening report PDF for an individual student
- `school-wide-send-student-report.ts` — Generates and emails speech screening reports for all students at a school, organized by grade

---

## Overview

These functions generate student speech screening reports based on the result and severity of each screening. The template used depends on the screening result (e.g., no errors, age-appropriate, qualified for services, absent). The school-wide version batches all students into a single ZIP file organized by grade.

---

## Individual Report (`send-student-report.ts`)

### Request Parameters

| Parameter | Required | Description |
|---|---|---|
| `speech_screening_id` | Yes | ID of the speech screening |
| `override_email` | No | Send to this email instead of looking up from staging table |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

### How It Works

1. Fetches the speech screening with student, school, and grade data
2. Resolves the recipient email (`override_email` → staging table lookup by student name → error)
3. Processes error patterns from the screening's `error_patterns` JSONB field
4. Selects a template based on the screening result (see Template Selection below)
5. Sends the report PDF to the document generation service
6. Logs the report to the `reports` table

### Template Selection

| Screening Result | Condition | Template |
|---|---|---|
| `no_errors` | — | No Errors |
| `age_appropriate` | — | Passed Age Appropriate |
| `complex_needs` | — | Complex Needs |
| `unable_to_screen` | — | Non Compliant |
| `absent` | — | Absent |
| `mild` / `moderate` / `severe` / `profound` | `qualifies_for_speech_program` = true, `sub` = true | Qualified Sub |
| `mild` / `moderate` / `severe` / `profound` | Otherwise | No Qualified Sub |

### Reports Table Entry

| Field | Value |
|---|---|
| `report_type` | `speech_screening_report` |
| `file_key` | `student_report_{speech_screening_id}` |
| `generated_by` | UUID from request, or `null` |
| `metadata` | `sent_to`, `errors_count`, `template_used`, `school_code` |

---

## School-Wide Report (`school-wide-send-student-report.ts`)

### Request Parameters

| Parameter | Required | Description |
|---|---|---|
| `school_id` | Yes | ID of the school |
| `academic_year` | Yes | Format: `"2024-2025"` |
| `override_email` | Yes | Email to receive all reports |
| `report_id` | No | ID in `school_reports_history` to update with status |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

### How It Works

1. Fetches school info and all student IDs for the school
2. Fetches screenings in batches of 50 students (100ms delay between batches to avoid rate limits)
3. Filters to the academic year window (Sept 1 – June 30) and deduplicates to the latest screening per student
4. Processes error patterns and selects a template for each student
5. Sorts all documents by grade using the `GRADE_MAPPING` order
6. Sends all documents as a single ZIP file (organized into grade subdirectories) to the document generation service
7. Updates `school_reports_history` if a `report_id` is provided
8. Logs a single bulk record to the `reports` table

### Template Selection

Same logic as the individual report.

### PDF Organization

- Each student's file: `{first_name}_{last_name}`
- Organized into subdirectories by grade (slashes converted to hyphens)
- All documents delivered as a single ZIP

### Reports Table Entry

| Field | Value |
|---|---|
| `report_type` | `school_wide_speech_screening_reports` |
| `file_key` | `school_reports_{school_id}_{academic_year}` |
| `generated_by` | UUID from request, or `null` |
| `metadata` | `sent_to`, `students_count`, `academic_year`, `school_name`, `school_code` |

> A single bulk record is logged — not one per student.

If a `report_id` is provided, `school_reports_history` is also updated:

| Field | Value |
|---|---|
| `status` | `"sent"` on success, `"failed"` on error |
| `form_type` | `"School Reports (class wide)"` |
| `sent_at` | Timestamp of successful delivery |

---

## Error Pattern Processing

Error patterns are read from the `error_patterns` JSONB field on each screening. The `Stimulability` value is filtered out of `errorPatterns` before processing. Each sound error is mapped to a human-readable pattern and example. Supported pattern types:

- **Omission** — sound is dropped entirely
- **Stopping** — fricative/affricate replaced by a stop consonant (e.g., "tad" for "sad")
- **Fronting** — back sound replaced by a front sound (e.g., "tootie" for "cookie")
- **Backing** — front sound replaced by a back sound (e.g., "cop" for "top")
- **Gliding** — liquid (L/R) replaced by a glide (W or Y)
- **Nasalization** — air escapes through the nose
- **Frontal/Lateral Lisp** — distorted S/Z production
- **Weak Syllable Deletion** — unstressed syllable dropped
- **Vowelization** — vocalic R replaced by a vowel
- **Atypical Substitution** — unusual substitution noted under "Other"

Multiple error patterns for the same sound are combined when a matching key exists in the lookup. If no combined key is found, each pattern is processed individually.

---

## Sound Ordering

Errors are sorted using phonological ordering rules that adapt based on detected patterns:

| Condition | Order Used |
|---|---|
| St-, T, or D backing detected | Backing Order |
| Sk-, Final -ks, K, or G fronting detected | Fronting Order |
| Any fronting | Fronting Sound Order |
| Any backing | Backing Sound Order |
| Default | Standard Sound Order |

Each error is assigned a sequential week number based on its position in the selected order.

---

## Key Differences

| | Individual | School-Wide |
|---|---|---|
| **Scope** | 1 student | All students at a school |
| **Email** | `override_email` or staging table | `override_email` required |
| **Output** | Single PDF | ZIP file organized by grade |
| **Batch processing** | No | Yes (50 students/batch with delays) |
| **Timeout** | Default | 10-minute extended timeout |
| **Logging table** | `reports` | `reports` + optionally `school_reports_history` |
| **Log type** | Single insert | Single bulk insert |
