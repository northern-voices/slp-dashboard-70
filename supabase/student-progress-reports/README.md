# Student Progress Reports

## Files

- `student-progress-report.js` — Generates and emails a progress report for two screenings of an individual student, explicitly chosen by the caller
- `school-wide-student-progress-report.js` — Generates and emails progress reports for all eligible students at a school, auto-pairing each student's current screening with their most recent prior one

---

## Overview

Progress reports compare two of a student's speech screenings to show growth over time, displaying error patterns and stimulability side by side. Delivery is a password-protected view link (not a raw PDF attachment): the function builds a document object, stores it as `report_data` on a `report_tokens` row behind a password hash, and emails a link to `/view-report/<token>` via AWS SES. The document is only rendered when someone opens the link and supplies the password.

The two functions pick the comparison screenings differently — the individual function takes both IDs directly from the caller (no auto-detection or academic-year window check), while the school-wide function still auto-pairs each student's most recent screening with the one immediately before it, subject to a 13-month window.

---

## Individual Report (`student-progress-report.js`)

### Request Parameters

| Parameter | Required | Description |
|---|---|---|
| `speech_screening_id_1` | Yes | One of the two screenings to compare |
| `speech_screening_id_2` | Yes | The other screening to compare — must be a different screening than `speech_screening_id_1` |
| `password` | Yes | Password protecting the generated report token |
| `override_emails` | No | Array of recipient emails; falls back to the `speech_screenings_staging` table (matched by student name) if omitted/empty |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

### How It Works

1. Fetches both screenings with student, school, and grade data
2. Validates both screenings exist, belong to the same student, and are different screenings
3. Rejects the request if either screening is marked absent
4. Sorts the two screenings chronologically — earlier is "initial"/"previous", later is "progress"/"current" (order they're passed in doesn't matter)
5. Resolves the recipient emails (`override_emails` → staging table lookup by student name → error)
6. Processes error patterns from both screenings
7. Builds the primary table by merging both screenings — one row per `(sound, pattern)` combination
8. Creates a password-protected `report_tokens` row and emails a secure view link
9. Logs the report to the `reports` table

There is no academic-year/13-month window check on this function — the caller is trusted to pick whichever two screenings they want compared (this is what the frontend's "Compare Against" screening picker does).

### Report Content

- Student name, grade, school
- Primary error table with sound, error pattern, example, initial screen stimulability, progress screen stimulability, and summary
- Progress notes (from `progress_notes` column on the later/"progress" screening)
- Template: **"Student Progress Report"**

### Reports Table Entry

| Field | Value |
|---|---|
| `report_type` | `speech_progress_report` |
| `file_key` | `progress_report_{previous_screening_id}_{current_screening_id}` |
| `generated_by` | UUID from request, or `null` |
| `metadata` | `sent_to`, `primary_table_count`, `progress_notes`, `initial_speech_screening_id`, `progress_speech_screening_id`, `delivery_method: "password_protected_link"`, `report_token` |

---

## School-Wide Report (`school-wide-student-progress-report.js`)

### Request Parameters

| Parameter | Required | Description |
|---|---|---|
| `school_id` | Yes | ID of the school |
| `academic_year` | Yes | Format: `"2024-2025"` |
| `override_emails` | Yes | Array of emails to receive the secure link (no staging-table fallback) |
| `password` | Yes | Password protecting the generated report token |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

### How It Works

1. Fetches school info and all screenings for students in that school
2. Filters screenings to the academic year window (Sept 1 – June 30) and excludes absent screenings
3. Groups screenings by student
4. For each student, requires at least 2 screenings to qualify — students with only one screening are skipped
5. Identifies current (most recent) and previous (immediately preceding, index - 1) screenings per student
6. Validates that the previous screening falls within the 13-month window (on or after July 1 of the academic year start) — students outside this window are skipped
7. Processes errors and builds the primary table for each student
8. Creates a single password-protected `report_tokens` row containing every qualifying student's document, and emails one secure view link
9. Logs a single bulk record to the `reports` table

If no students qualify, the function returns `success: false` with an explanatory message instead of generating a token.

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
| `metadata` | `sent_to`, `student_count`, `academic_year`, `delivery_method: "password_protected_link"`, `report_token` |

> A single bulk record is logged (not one per student).

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

Multiple error patterns for the same sound are combined when a matching combined key exists in the lookup (e.g., "Omits S and Backing"). If no combined key is found, each pattern is processed individually.

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

Only the **school-wide report** validates this: the previous screening must fall within the current academic year's 13-month window — on or after **July 1** of the academic year start year, derived from the `academic_year` parameter. Students whose previous screening falls outside this window are skipped rather than failing the whole batch.

The **individual report** has no such check — the caller explicitly picks both screenings to compare, so there's nothing to auto-detect or validate a window against.

---

## Email Delivery

The recipient list is resolved in this order (`student-progress-report.js` only — `school-wide-student-progress-report.js` requires `override_emails` with no fallback):

1. `override_emails` parameter (if provided)
2. Email from the `speech_screenings_staging` table matched by student name

If neither is found, the individual report function returns an error.
