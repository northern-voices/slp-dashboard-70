# Goal Sheet Reports

## Files

- `student-goal-sheet.js` — Generates and emails a goal sheet PDF for an individual student
- `school-wide-student-goal-sheets.ts` — Sends goal sheets to all students at a school

---

## Overview

### Overview

The goal sheet is a PDF document sent to a parent/guardian email summarizing a student's speech screening results and associated error patterns. The document template and content vary based on the student's grade level.

For each sound error, the template includes a strategies section and three fixed session blocks. Each session block has fields for the date, progress checkboxes, activities, and comments. A final mastered/needs-more-practice indicator appears after all three sessions.

### Grade-Based Categories

#### Early Childhood Grades

Grades: **Nursery, Pre-K, K4, K5, Kindergarten, Headstart**

- Only **primary sounds** are included in the goal sheet
- Secondary sounds are excluded
- Template used: **"Goal Sheet Primary Only v2"**

> **Fallback:** If a student in an early childhood grade has zero primary errors, the function re-processes the screening and includes secondary sounds as a fallback. The "Goal Sheet Primary Only v2" template is still used, with the secondary errors placed in the primary slot.

#### Elementary Grades (All Other Grades)

- Both **primary and secondary sounds** are processed
- The template depends on which errors are found:

| Errors Present | Template Used |
|---|---|
| Primary + Secondary | Goal Sheet Primary Secondary |
| Primary only | Goal Sheet Primary Only v2 |
| Secondary only | Goal Sheet Primary Only v2 (secondary moved to primary slot) |
| None | Goal Sheet Primary Only v2 (empty) |

---

### Sound Categories

#### Primary Sounds
`2 syllables`, `3 syllables`, `P`, `B`, `M`, `Final P`, `Final T`, `Final K`, `St-`, `Sp-`, `Sn-`, `Sm-`, `Sk-`, `Final -ps`, `Final -ts`, `Final -ks`, `K`, `G`, `T`, `D`, `S`

#### Secondary Sounds
`L`, `R`, `Z`, `Ch`, `J`, `Sh`, `F`, `V`, `-ar`, `-er`, `-or`, `th`

---

### Error Pattern Processing

Each sound error from the screening's `error_patterns` JSONB field is mapped to a human-readable pattern and example via the `getErrorPatternsLookup()` table. The `Stimulability` value is filtered out of `errorPatterns` before processing. The lookup covers patterns such as:

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

Multiple error patterns for the same sound are combined when a matching combined key exists in the lookup (e.g., "Frontal Lisp and Backing"). If no combined key is found, each pattern is processed individually.

---

### Sound Ordering

Errors are sorted for display using phonological ordering rules. The ordering adapts based on which error patterns are present:

| Condition | Order Used |
|---|---|
| St-, T, or D backing detected | Goal Sheet Backing Order |
| Sk-, Final -ks, K, or G fronting detected | Goal Sheet Fronting Order |
| Any fronting | Fronting Sound Order |
| Any backing | Backing Sound Order |
| Default | Standard Sound Order |

Errors are sorted by their position in the selected order and passed to the template in that sequence.

---

### Example Request (`student-goal-sheet.js`)

```bash
curl -L -X POST 'https://tvdnhcocgvuzeonejiut.supabase.co/functions/v1/student-goal-sheet' \
  -H 'Authorization: Bearer <anon_key>' \
  -H 'Content-Type: application/json' \
  --data '{"speech_screening_id": "<uuid>", "override_email": "recipient@example.com"}'
```

---

### Request Parameters (`student-goal-sheet.js`)

| Parameter | Required | Description |
|---|---|---|
| `speech_screening_id` | Yes | ID of the speech screening |
| `override_email` | No | Send to this email instead of looking up from staging table |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

### Request Parameters (`school-wide-student-goal-sheets.ts`)

| Parameter | Required | Description |
|---|---|---|
| `school_id` | Yes | ID of the school |
| `academic_year` | Yes | Format: `"2024-2025"` |
| `override_email` | Yes | Email to receive all goal sheets |
| `report_id` | No | ID in `school_reports_history` to update with status |
| `generated_by` | No | UUID of the user triggering the report (stored in `reports.generated_by`) |

---

### Email Delivery

The goal sheet PDF is sent via a document generation service. The recipient email is resolved in this order:

1. `override_email` parameter (if provided in the request)
2. Email from the `speech_screenings_staging` table matched by student name

If neither is found, the function returns an error.

---

### Reports Table Entry (`student-goal-sheet.js`)

| Field | Value |
|---|---|
| `report_type` | `speech_goals_report` |
| `file_key` | `goal_sheet_{speech_screening_id}` |
| `generated_by` | UUID from request, or `null` |
| `metadata` | `sent_to`, `primary_errors_count`, `secondary_errors_count`, `vocabulary_support`, `grade_level` |

### Reports Table Entry (`school-wide-student-goal-sheets.ts`)

| Field | Value |
|---|---|
| `report_type` | `school_wide_speech_goals_reports` |
| `file_key` | `goal_sheets_{school_id}_{academic_year}` |
| `generated_by` | UUID from request, or `null` |
| `metadata` | `sent_to`, `students_count`, `qualified_count`, `sub_count`, `academic_year`, `school_name` |

> A single bulk record is logged for the school-wide version — not one per student.

If a `report_id` is provided, `school_reports_history` is also updated:

| Field | Value |
|---|---|
| `status` | `"sent"` on success, `"failed"` on error |
| `form_type` | `"School Goal Sheets (class wide)"` |
| `sent_at` | Timestamp of successful delivery |
