# School Summary Report

## Files

- `school-summary-report.js` — Generates and emails a PDF summary of a school's speech screening results for an academic year

---

## Overview

This function produces a school-level summary report of all speech screenings for a given academic year. It identifies which students qualified for speech services, which are in the sub program, and which have referral notes. The template used depends on whether any students have recommendations.

Delivery is a password-protected view link (not a raw PDF attachment): the function builds a document object, stores it as `report_data` on a `report_tokens` row behind a password hash, and emails a link to `/view-report/<token>` via AWS SES. The document is only rendered when someone opens the link and supplies the password.

---

## Request Parameters

| Parameter | Required | Description |
|---|---|---|
| `school_id` | Yes | ID of the school |
| `academic_year` | Yes | Format: `"2024-2025"` |
| `password` | Yes | Password protecting the generated report token |
| `override_emails` | Yes | Array of emails to send the summary to |
| `report_id` | No | ID in `school_reports_history` to update with status |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

---

## How It Works

1. Fetches school info and all student IDs for the school
2. Fetches speech screenings in batches of 50 students (100ms delay between batches)
3. Filters to the academic year window (Sept 1 – June 30) and deduplicates to the latest screening per student
4. Categorizes each student:
   - **Qualified**: `qualifies_for_speech_program` = true
   - **Sub**: `sub` = true
   - **Has recommendations**: `referral_notes` is present
5. Selects a template based on whether any students have recommendations
6. Creates a password-protected `report_tokens` row and emails a secure view link
7. Updates `school_reports_history` if a `report_id` is provided

---

## Template Selection

| Condition | Template Used |
|---|---|
| Any student has recommendations | Summary with recommendations |
| No recommendations | Summary without recommendations |

---

## Reports Table Entry

| Field | Value |
|---|---|
| `report_type` | `school_wide_speech_summary_report` |
| `is_bulk` | `true` |
| `file_key` | `school_summary_{school_id}_{academic_year}` |
| `generated_by` | UUID from request, or `null` |
| `metadata` | `sent_to`, `academic_year`, `delivery_method: "password_protected_link"`, `report_token` |

If a `report_id` is provided, `school_reports_history` is also updated:

| Field | Value |
|---|---|
| `status` | `"sent"` on success, `"failed"` on error |
| `form_type` | `"School Summary Report"` |
| `sent_at` | Timestamp of successful delivery |
