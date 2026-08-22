# Hearing Reports

## Files

- `generate-hearing-report.js` — Generates and emails a hearing report PDF for an individual student
- `school-wide-student-hearing-reports.js` — Generates hearing reports for all students at a school plus a summary, sent as one batch
- `school-summary-hearing-report.js` — Generates a summary-only hearing report for a school

---

## Overview

Hearing reports are generated from `hearing_screenings` records. The template used depends on each student's tympanometry results (Type A/AS/AD = pass) and any special clinical notes (Absent, Non-compliant, Complex Needs).

---

## Individual Report (`generate-hearing-report.js`)

### Request Parameters

| Parameter | Required | Description |
|---|---|---|
| `hearing_screening_id` | Yes | ID of the hearing screening record |
| `override_email` | Yes | Email to send the report to (no database fallback) |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

### How It Works

1. Fetches the hearing screening with student, school, and grade data
2. Extracts measurement values and results for both ears
3. Selects a template based on clinical notes and ear results (see Template Selection below)
4. Sends the report PDF to the document generation service
5. Logs the report to the `reports` table

### Template Selection

| Condition | Template |
|---|---|
| `clinical_notes` = "Absent" | (A) Absent |
| `clinical_notes` = "Non-compliant" | (NC) Non-compliant |
| `clinical_notes` = "Complex Needs" | (CN) Complex Needs |
| Both ears = "Type A" (staff) | (P) Pass - Staff |
| Both ears = "Type A" (student) | (P) Pass |
| Otherwise (staff) | (F) Fail - Staff |
| Otherwise (student) | (F) Fail |

> Note: Only exact "Type A" qualifies as a pass here — Type AS and Type AD do not.

Fail templates include full measurement data (volumes, compliance, pressure) in the document context.

### Reports Table Entry

| Field | Value |
|---|---|
| `report_type` | `hearing_screening_report` |
| `file_key` | `hearing_report_{hearing_screening_id}` |
| `generated_by` | UUID from request, or `null` |
| `metadata` | `sent_to`, `template_used`, `school_code`, `right_ear_result`, `left_ear_result` |

---

## School-Wide Report (`school-wide-student-hearing-reports.js`)

### Request Parameters

| Parameter | Required | Description |
|---|---|---|
| `school_id` | Yes | ID of the school |
| `academic_year` | Yes | Format: `"2024-2025"` |
| `override_email` | No | Overrides the school's `principal_email` |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

### How It Works

1. Fetches school info and all hearing screenings for that school within the academic year (Sept 1 – June 30)
2. Deduplicates to the latest screening per student
3. Sorts students by grade using the `HEARING_GRADE_MAPPING` order (Headstart → Grade 12 → Staff last)
4. Selects a template for each student (see Template Selection below)
5. Organizes PDFs into grade-level directories
6. Appends a school summary document listing all referred students
7. Sends all documents (student reports + summary) in one batch email
8. Logs a single bulk record to the `reports` table

### Template Selection

Same conditions as the individual report with one difference — passing criteria is broader:

| Condition | Template |
|---|---|
| `result` contains "absent" (case-insensitive) | (A) Absent |
| `clinical_notes` = "Non-compliant" | (NC) Non-compliant |
| `clinical_notes` = "Complex Needs" | (CN) Complex Needs |
| Both ears = Type A, AS, or AD (staff) | (P) Pass - Staff |
| Both ears = Type A, AS, or AD (student) | (P) Pass |
| Otherwise (staff) | (F) Fail - Staff |
| Otherwise (student) | (F) Fail |

> Type AS and Type AD also count as passing here (broader than the individual report).

### PDF Organization

- Each student's file: `{first_name}_{last_name}`
- Organized into subdirectories by grade (slashes converted to hyphens)
- Summary document appended at the end

### Reports Table Entry

| Field | Value |
|---|---|
| `report_type` | `school_wide_hearing_screenings_report` |
| `is_bulk` | `true` |
| `file_key` | `hearing_reports_bulk_{school_id}_{academic_year}` |
| `generated_by` | UUID from request, or `null` |
| `metadata` | `sent_to`, `academic_year`, `student_count`, `referred_count`, `school_name`, `school_code`, `includes_summary_report` |

> A single bulk record is logged — not one per student.

---

## Summary-Only Report (`school-summary-hearing-report.js`)

### Request Parameters

| Parameter | Required | Description |
|---|---|---|
| `school_id` | Yes | ID of the school |
| `academic_year` | Yes | Format: `"2024-2025"` |
| `override_email` | Yes | Email to send the summary to (no fallback) |
| `report_id` | No | ID in `school_reports_history` to update with status |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

### How It Works

1. Fetches all student IDs for the school
2. Fetches hearing screenings in batches of 50 students (with 100ms delays between batches to avoid overloading the database)
3. Filters to the academic year window and deduplicates to one screening per student
4. Identifies referred students (either ear fails, student not absent)
5. Generates a summary-only PDF (no individual student reports)
6. Sends it to the provided email
7. If a `report_id` is provided, updates the existing record in `school_reports_history` with status `"sent"` or `"failed"`

### Referral Logic

A student is referred if:
- They are **not** marked as absent
- **Either** ear result is not one of: Type A, Type AS, Type AD

### Reports Table Entry

| Field | Value |
|---|---|
| `report_type` | `school_wide_hearing_summary_report` |
| `is_bulk` | `true` |
| `file_key` | `hearing_summary_{school_id}_{academic_year}` |
| `generated_by` | UUID from request, or `null` |
| `metadata` | `sent_to`, `academic_year` |

If a `report_id` is provided, `school_reports_history` is also updated:

| Field | Value |
|---|---|
| `status` | `"sent"` on success, `"failed"` on error |
| `form_type` | `"Hearing Summary Report"` |
| `sent_at` | Timestamp of successful delivery |

> Only updates an existing record if `report_id` is provided — does not insert a new one.

---

## Key Differences

| | Individual | School-Wide | Summary Only |
|---|---|---|---|
| **Scope** | 1 student | All students + summary | Summary only |
| **Email** | `override_email` required | `override_email` or `principal_email` | `override_email` required |
| **Passing criteria** | Type A only | Type A, AS, AD | Type A, AS, AD |
| **Output** | Student report | Student reports + summary | Summary only |
| **Batch processing** | No | No | Yes (50 students/batch) |
| **Logging table** | `reports` | `reports` | `school_reports_history` |
| **Log type** | Single insert | Single bulk insert | Update existing record |
