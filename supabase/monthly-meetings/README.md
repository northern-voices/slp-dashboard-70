# Monthly Meetings

## Files

- `monthly-meetings.js` — Generates and emails a PDF document from a monthly meeting record

---

## Overview

This function generates a meeting document from a `monthly_meetings` record, including facilitator info, student updates, action plans, and additional notes.

Delivery is a password-protected view link (not a raw PDF attachment): the function builds a document object, stores it as `report_data` on a `report_tokens` row behind a password hash, and emails a link to `/view-report/<token>` via AWS SES. The document is only rendered when someone opens the link and supplies the password.

---

## Request Parameters

| Parameter | Required | Description |
|---|---|---|
| `monthly_meeting_id` | Yes | ID of the monthly meeting record |
| `password` | Yes | Password protecting the generated report token |
| `override_emails` | Yes | Array of emails to send the document to |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

---

## How It Works

1. Fetches the meeting record from `monthly_meetings`
2. Looks up the facilitator name from `users` (if `facilitator_id` is set)
3. Looks up the school name from `schools` (if `school_id` is set)
4. Fetches all student updates from `monthly_meeting_student_updates`, joined with student names and program status
5. Formats the meeting date (e.g., "March 4, 2026")
6. Maps each student update to: name, sessions attended, meeting notes, and whether they are in the sub program
7. Picks a template based on `meeting_type` and builds the document context
8. Creates a password-protected `report_tokens` row and emails a secure view link
9. Logs the report to the `reports` table

---

## Templates

| `meeting_type` | Template |
|---|---|
| `progress_checkin` | `"Monthly Meetings"` — includes the student updates table |
| `coaching_call` | `"Coaching Call School Summary"` — shows `topics` instead of the table |
| `school_visit_summary` | `"Coaching Call School Summary"` — shows `school_visit_purpose` instead of the table |

---

## Document Content

- Meeting title, date, facilitator, school
- Attendees
- Student updates table (`progress_checkin` only: name, sessions, notes, sub status)
- Topics discussed (`coaching_call` only, if present)
- Visit purpose (`school_visit_summary` only, if present)
- Action plan (if present)
- Additional notes (if present)

---

## Reports Table Entry

| Field | Value |
|---|---|
| `report_type` | `monthly_meeting` |
| `file_key` | `monthly_meeting_{monthly_meeting_id}` |
| `generated_by` | UUID from request, or `null` |
| `metadata` | `sent_to`, `meeting_title`, `meeting_date`, `student_count`, `delivery_method: "password_protected_link"`, `report_token` |
