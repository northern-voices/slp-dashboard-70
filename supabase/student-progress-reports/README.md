# Student Progress Reports

## Files

- `student-progress-report.js` — Generates and emails a progress report PDF for an individual student
- `school-wide-student-progress-report.js` — Generates and emails progress reports for all eligible students at a school

---

## Overview

Progress reports compare a student's current speech screening against their most recent prior screening to show growth over time. They display current and previous error patterns side by side including stimulability data for each sound.

---

## Individual Report (`student-progress-report.js`)

### Request Parameters

| Parameter | Required | Description |
|---|---|---|
| `speech_screening_id` | Yes | ID of the current speech screening |
| `override_email` | No | Send to this email instead of looking up from staging table |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

### How It Works

1. Fetches the current screening with student and school data
2. Fetches all prior screenings for the same student (sorted oldest to newest)
3. Identifies the screening immediately before the current one (index - 1) as the "previous" screening — if none exists, the function fails
4. Validates that the previous screening falls within the 13-month window (on or after July 1 of the current academic year) — if not, the function fails
5. Resolves the recipient email (`override_email` → staging table lookup → error)
6. Processes error patterns from both screenings
7. Builds the primary table by merging both screenings — one row per `(sound, pattern)` combination
8. Sends the report PDF to the document generation service
9. Logs the report to the `reports` table

### Report Content

- Student name, grade, school
- Primary error table with sound, error pattern, example, initial screen stimulability, progress screen stimulability, and summary
- Progress notes (from `progress_notes` column on `speech_screenings`)
- Template: **"Student Progress Report"**

### Reports Table Entry

| Field | Value |
|---|---|
| `report_type` | `speech_progress_report` |
| `file_key` | `progress_report_{speech_screening_id}` |
| `generated_by` | UUID from request, or `null` |
| `metadata` | `sent_to`, `primary_table_count`, `progress_notes` |

---

## School-Wide Report (`school-wide-student-progress-report.js`)

### Request Parameters

| Parameter | Required | Description |
|---|---|---|
| `school_id` | Yes | ID of the school |
| `academic_year` | Yes | Format: `"2024-2025"` |
| `override_email` | No | Send all reports to this email instead |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

### How It Works

1. Fetches school info and all screenings for students in that school
2. Filters screenings to the academic year window (Sept 1 – June 30) and excludes absent screenings
3. Groups screenings by student
4. For each student, requires at least 2 screenings to qualify — students with only one screening are skipped
5. Identifies current (most recent) and previous (immediately preceding, index - 1) screenings per student
6. Validates that the previous screening falls within the 13-month window (on or after July 1 of the academic year start) — students outside this window are skipped
7. Processes errors and builds the primary table for each student
8. Sends all documents in a single batch request to the document generation service
9. Logs a single batch record to the `reports` table

### Report Content

Same as the individual report per student. Files are organized by grade directory:
- `file_name`: `{first_name}_{last_name}-PR`
- `directory`: Grade level (slashes converted to hyphens)

### Reports Table Entry

| Field | Value |
|---|---|
| `report_type` | `school_wide_speech_progress_reports` |
| `file_key` | `school_progress_report_{school_id}_{academic_year}` |
| `generated_by` | UUID from request, or `null` |
| `metadata` | `sent_to`, `student_count`, `academic_year` |

> A single batch record is logged (not one per student).

---

## Primary Table

The primary table contains one row per `(sound, pattern)` combination, merged across both screenings. The same sound can appear multiple times if it has multiple error patterns.

| Column | Description |
|---|---|
| `sound` | The target sound (e.g. `Sp-`, `K`, `R`) |
| `pattern` | The error pattern (e.g. `Omits S`, `Fronting`) |
| `example` | A word example illustrating the error |
| `initial_screen` | Stimulability data from the previous screening |
| `progress_screen` | Stimulability data from the current screening |
| `summary` | Empty placeholder |

A blank `initial_screen` means the error is new since the previous screening. A blank `progress_screen` means the error no longer appears in the current screening.

---

## Error Pattern Processing

Error patterns are read from the `error_patterns` JSONB field on each screening. Each sound error is mapped to a human-readable pattern and example. The `Stimulability` value is filtered out of `errorPatterns` before processing. Supported pattern types:

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

Multiple error patterns for the same sound are combined when a matching combined key exists in the lookup. If no combined key is found, each pattern is processed individually.

---

## Sound Ordering

Errors are sorted using phonological ordering rules that adapt based on detected patterns:

| Condition | Order Used |
|---|---|
| Any fronting detected | Fronting Sound Order |
| Any backing detected | Backing Sound Order |
| Default | Standard Sound Order |

Each error is assigned a sequential week number based on its position in the selected order.

---

## 13-Month Window Validation

Both functions validate that the previous screening falls within the current academic year's 13-month window — on or after **July 1** of the academic year start year.

- **Individual report**: derived from the current screening's date. Throws an error if the previous screening is outside the window.
- **School-wide report**: derived from the `academic_year` parameter. Skips the student if the previous screening is outside the window.

---

## Email Delivery

Reports are sent as PDFs via the document generation service. The recipient email is resolved in this order:

1. `override_email` parameter (if provided)
2. Email from the `speech_screenings_staging` table matched by student name

If neither is found, the individual report function returns an error. For school-wide reports, `override_email` is required or the staging table must have an entry for each student.
