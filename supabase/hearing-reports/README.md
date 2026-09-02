# Hearing Reports

## Files

- `generate-hearing-report.js` — Generates and emails a hearing report for an individual student
- `school-wide-student-hearing-reports.js` — Generates hearing reports for all students at a school plus a summary, sent as one secure link
- `school-summary-hearing-report.js` — Generates a summary-only hearing report for a school

---

## Overview

Hearing reports are generated from `hearing_screenings` records. The template used depends on each student's tympanometry results (Type A/AS/AD = pass) and any special clinical notes (Absent, Non-compliant, Complex Needs).

Delivery is a password-protected view link (not a raw PDF attachment): each function builds a document object, stores it as `report_data` on a `report_tokens` row behind a password hash, and emails a link to `/view-report/<token>` via AWS SES. The document is only rendered when someone opens the link and supplies the password. The school-wide version stores every student's document plus the summary together as one `report_tokens` row (an array of documents), delivered as a single link to a multi-document viewer.

---

## Individual Report (`generate-hearing-report.js`)

### Request Parameters

| Parameter | Required | Description |
|---|---|---|
| `hearing_screening_id` | Yes | ID of the hearing screening record |
| `password` | Yes | Password protecting the generated report token |
| `override_emails` | Yes | Array of recipient emails (no database fallback) |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

### How It Works

1. Fetches the hearing screening with student, school, and grade data
2. Extracts measurement values and results for both ears
3. Selects a template based on clinical notes and ear results (see Template Selection below)
4. Creates a password-protected `report_tokens` row and emails a secure view link
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
| `metadata` | `sent_to`, `template_used`, `school_code`, `right_ear_result`, `left_ear_result`, `delivery_method: "password_protected_link"`, `report_token` |

---

## School-Wide Report (`school-wide-student-hearing-reports.js`)

### Request Parameters

| Parameter | Required | Description |
|---|---|---|
| `school_id` | Yes | ID of the school |
| `academic_year` | Yes | Format: `"2024-2025"` |
| `password` | Yes | Password protecting the generated report token |
| `override_emails` | No | Array of emails; falls back to the school's `principal_email` if omitted/empty |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

### How It Works

1. Fetches school info and all hearing screenings for that school within the academic year (Sept 1 – June 30)
2. Deduplicates to the latest screening per student
3. Sorts students by grade using the `HEARING_GRADE_MAPPING` order (Headstart → Grade 12 → Staff last)
4. Selects a template for each student (see Template Selection below)
5. Tags each document with a grade-level directory
6. Appends a school summary document listing all referred students
7. Creates a single password-protected `report_tokens` row containing every student's document plus the summary, and emails one secure view link
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

### Document Organization

- Each document is tagged with `metadata.directory` set to the student's grade (slashes converted to hyphens)
- Summary document appended at the end
- The frontend's `BulkReportView` uses `metadata.directory` to group/filter documents when the link is opened

### Reports Table Entry

| Field | Value |
|---|---|
| `report_type` | `school_wide_hearing_screenings_report` |
| `is_bulk` | `true` |
| `file_key` | `hearing_reports_bulk_{school_id}_{academic_year}` |
| `generated_by` | UUID from request, or `null` |
| `metadata` | `sent_to`, `academic_year`, `student_count`, `referred_count`, `school_name`, `school_code`, `includes_summary_report`, `delivery_method: "password_protected_link"`, `report_token` |

> A single bulk record is logged — not one per student.

---

## Summary-Only Report (`school-summary-hearing-report.js`)

### Request Parameters

| Parameter | Required | Description |
|---|---|---|
| `school_id` | Yes | ID of the school |
| `academic_year` | Yes | Format: `"2024-2025"` |
| `password` | Yes | Password protecting the generated report token |
| `override_emails` | Yes | Array of emails to receive the summary (no fallback) |
| `report_id` | No | ID in `school_reports_history` to update with status |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

### How It Works

1. Fetches all student IDs for the school
2. Fetches hearing screenings in batches of 50 students (with 100ms delays between batches to avoid overloading the database)
3. Filters to the academic year window and deduplicates to one screening per student
4. Identifies referred students (either ear fails, student not absent)
5. Builds a summary-only document (no individual student reports)
6. Creates a password-protected `report_tokens` row and emails a secure view link
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
| `metadata` | `sent_to`, `academic_year`, `delivery_method: "password_protected_link"`, `report_token` |

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
| **Email** | `override_emails` required | `override_emails` or `principal_email` | `override_emails` required |
| **Passing criteria** | Type A only | Type A, AS, AD | Type A, AS, AD |
| **Output** | One secure view link, one document | One secure view link to a multi-document viewer (grouped by grade) | One secure view link, summary only |
| **Batch processing** | No | No | Yes (50 students/batch) |
| **Logging table** | `reports` | `reports` | `reports` + optionally `school_reports_history` |
| **Log type** | Single insert | Single bulk insert | Single insert + optional history update |
