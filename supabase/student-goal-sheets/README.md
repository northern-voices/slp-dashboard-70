# Goal Sheet Reports

## Files

- `student-goal-sheet.js` — Generates a goal sheet for one student/screening picked manually by an SLP (Level 1, Level 2, or both)
- `school-wide-student-goal-sheets.ts` — Generates goal sheets for every qualifying student at a school at once, bundled into one document; always defaults to Level 1
- `../_shared/goalSheetLevels.ts` — Shared Level 1/Level 2 classification logic used by both functions above

---

## Overview

A goal sheet summarizes a student's speech screening sound errors, along with strategies and weekly practice worksheets for whichever sounds are being targeted. Delivery is a password-protected view link (not a raw PDF attachment): the function builds a document object, stores it as `report_data` on a `report_tokens` row behind a password hash, and emails a link to `/view-report/<token>` via AWS SES. The document is only rendered when someone opens the link and supplies the password.

For each targeted sound error, the goal sheet includes a strategies section and three fixed session blocks (date, progress checkboxes, activities, comments), plus a final mastered/needs-more-practice indicator.

---

## Goal Sheet Levels (Level 1 / Level 2)

Sounds are classified as **Level 1** (early-developing) or **Level 2** (later-developing) — this replaced the old "Cycle 1 / Cycle 2" terminology. All classification logic lives in `../_shared/goalSheetLevels.ts` and is shared by both functions in this folder.

### Default classification

| Level                        | Sounds                                                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Level 1 (`PRIMARY_SOUNDS`)   | `2 syllables`, `3 syllables`, `P`, `B`, `M`, `Final P`, `Final T`, `Final K`, `St-`, `Sp-`, `Sn-`, `Sm-`, `Sk-`, `Final -ps`, `Final -ts`, `Final -ks`, `K`, `G`, `T`, `D`, `S` |
| Level 2 (`SECONDARY_SOUNDS`) | `L`, `R`, `Z`, `Ch`, `J`, `Sh`, `F`, `V`, `-ar`, `-er`, `-or`, `th`                                                                                                             |

### Reclassification: blends deferred to Level 2

A base sound's own blends/clusters get deferred from Level 1 to Level 2 once that base shows a specific error pattern, so the student practices the simpler form first:

| Family     | Triggers when this sound shows...                              | ...this pattern              | Defers these sounds to Level 2                           |
| ---------- | -------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------- |
| K-fronting | K, G, Final K, Sk-, Final -ks                                  | Fronting                     | Sk-, Final -ks                                           |
| T-backing  | T, D, Final T, St-, Final -ts                                  | Backing                      | St-, Final -ts                                           |
| Lisp       | S, Z, St-, Sp-, Sm-, Sn-, Sk-, Final -ts, Final -ps, Final -ks | Frontal Lisp or Lateral Lisp | St-, Sp-, Sm-, Sn-, Sk-, Final -ts, Final -ps, Final -ks |

### Word-gating on reclassification

A blend only actually defers to Level 2 once every currently-active base sound targeting it has reached **Word** stimulability (not just Sound or Non-Stimulable):

- **Gate not met** (a base sound is below Word): the blend stays on Level 1 unchanged, using its own real recorded stimulability. The base sound itself gets an extra entry synthesized onto the Level 2 document instead, always shown at Word, reusing that base's own existing strategies/QR content (e.g. T's Backing content).
- **Gate met**: the blend defers to Level 2 as normal, but its displayed stimulability is always forced to Word, regardless of whatever was actually recorded for the blend on the screening.
- A blend can be targeted by two rules at once (e.g. St- by both T-backing and a lisp) — it only unlocks once **every** active trigger's base sound has reached Word, not just one of them.
- A rule with no separate base-sound entry to check (only the blend itself carries the pattern, with no distinct base-sound entry in `soundErrors`) has nothing to gate on, so it defers unconditionally.

### Grade 1+ override

A student in grade 1 or older whose only sound errors are Level 2 sounds — zero Level 1 sounds in error at all — has all of those sounds relabeled Level 1, since for that student those sounds are genuinely their starting point. A student with at least one real Level 1 sound error is unaffected, and students below grade 1 always keep the default classification. Grade comparison uses a local mirror of the frontend's `GRADE_MAPPING` order (`src/constants/app.ts`), since this Deno function can't import from `src/`.

### Both-levels sending (`student-goal-sheet.js` only)

Passing `level: 'both'` generates Level 1 and Level 2 as two separate documents/tokens (sharing one password), delivered as **one email with two links**. A level that comes back with zero sound errors is silently skipped rather than sending a blank link — this is what actually happens for a grade-1+/all-Level-2-sounds student, since their Level 2 table ends up empty once everything gets relabeled Level 1. If both levels come back empty, the function throws instead of sending nothing.

`school-wide-student-goal-sheets.ts` does not support `'both'` — it always requests Level 1 for every student.

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

Multiple error patterns for the same sound are combined when a matching combined key exists in the lookup (e.g., "Omits S and Backing"). If no combined key is found, each pattern is processed individually.

---

### Sound Ordering

Errors are sorted for display using phonological ordering rules. The ordering adapts based on which error patterns are present:

| Condition                                 | Order Used                |
| ----------------------------------------- | ------------------------- |
| St-, T, or D backing detected             | Goal Sheet Backing Order  |
| Sk-, Final -ks, K, or G fronting detected | Goal Sheet Fronting Order |
| Any fronting                              | Fronting Sound Order      |
| Any backing                               | Backing Sound Order       |
| Default                                   | Standard Sound Order      |

Errors are sorted by their position in the selected order and passed to the template in that sequence.

---

### Example Request (`student-goal-sheet.js`)

```bash
curl -L -X POST 'https://tvdnhcocgvuzeonejiut.supabase.co/functions/v1/student-goal-sheet' \
  -H 'Authorization: Bearer <anon_key>' \
  -H 'Content-Type: application/json' \
  --data '{"speech_screening_id": "<uuid>", "level": 1, "override_emails": ["recipient@example.com"], "password": "<password>"}'
```

`level` can be `1`, `2`, or `"both"`.

---

### Request Parameters (`student-goal-sheet.js`)

| Parameter             | Required | Description                                                                                                               |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `speech_screening_id` | Yes      | ID of the speech screening                                                                                                |
| `level`               | Yes      | `1`, `2`, or `"both"`                                                                                                     |
| `password`            | Yes      | Password protecting the generated report token(s)                                                                         |
| `override_emails`     | No       | Array of recipient emails; falls back to the `speech_screenings_staging` table (matched by student name) if omitted/empty |
| `generated_by`        | No       | UUID of the user triggering the report (stored in `reports.generated_by`)                                                 |

### Request Parameters (`school-wide-student-goal-sheets.ts`)

| Parameter         | Required | Description                                                               |
| ----------------- | -------- | ------------------------------------------------------------------------- |
| `school_id`       | Yes      | ID of the school                                                          |
| `academic_year`   | Yes      | Format: `"2024-2025"`                                                     |
| `override_emails` | Yes      | Array of emails to receive the secure link (no staging-table fallback)    |
| `password`        | Yes      | Password protecting the generated report token                            |
| `report_id`       | No       | ID in `school_reports_history` to update with status                      |
| `generated_by`    | No       | UUID of the user triggering the report (stored in `reports.generated_by`) |

---

### Email Delivery

A single email is sent via AWS SES containing a secure view link (or two links, for `'both'` mode). The recipient list is resolved in this order (`student-goal-sheet.js` only — `school-wide-student-goal-sheets.ts` requires `override_emails` with no fallback):

1. `override_emails` parameter (if provided in the request)
2. Email from the `speech_screenings_staging` table matched by student name

If neither is found, the function returns an error.

---

### Reports Table Entry (`student-goal-sheet.js`)

One row is logged per level actually sent (two rows for `'both'` mode).

| Field          | Value                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `report_type`  | `speech_goals_report`                                                                                                                 |
| `file_key`     | `goal_sheet_{speech_screening_id}` (single level) or `goal_sheet_{speech_screening_id}_level{n}` (`'both'` mode)                      |
| `generated_by` | UUID from request, or `null`                                                                                                          |
| `metadata`     | `sent_to`, `level`, `errors_count`, `vocabulary_support`, `grade_level`, `delivery_method: "password_protected_link"`, `report_token` |

### Reports Table Entry (`school-wide-student-goal-sheets.ts`)

| Field          | Value                                                                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `report_type`  | `school_wide_speech_goals_reports`                                                                                                                        |
| `file_key`     | `goal_sheets_{school_id}_{academic_year}`                                                                                                                 |
| `generated_by` | UUID from request, or `null`                                                                                                                              |
| `metadata`     | `sent_to`, `students_count`, `qualified_count`, `sub_count`, `academic_year`, `school_name`, `delivery_method: "password_protected_link"`, `report_token` |

> A single bulk record is logged for the school-wide version — not one per student.

If a `report_id` is provided, `school_reports_history` is also updated:

| Field       | Value                                    |
| ----------- | ---------------------------------------- |
| `status`    | `"sent"` on success, `"failed"` on error |
| `form_type` | `"School Goal Sheets (class wide)"`      |
| `sent_at`   | Timestamp of successful delivery         |
