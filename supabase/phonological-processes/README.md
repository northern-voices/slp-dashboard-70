# Phonological Processes

## Files

- `phonological_processes.js` — Lookup table of speech error patterns and examples, shared across report functions

---

## Overview

This is a pure data module that exports a single function `getErrorPatternsLookup()`. It returns a comprehensive nested object mapping sounds to their possible error patterns and pronunciation examples. It contains no logic, makes no API calls, and produces no output on its own.

> **Currently unused.** No other function in `supabase/` imports this module, and it has no matching entry under `supabase/functions/` (so it isn't deployed). The goal sheet, progress report, and student report functions each maintain their own internal copy of `getErrorPatternsLookup()` instead of importing this one — a pre-existing duplication pattern in this codebase, not something introduced recently. Kept around as a reference/legacy copy; changes here won't affect any live function.

---

## Structure

The lookup is organized by sound, then by error pattern name:

```js
{
  'S': {
    'Frontal Lisp': {
      pattern: 'Frontal Lisp',
      example: "'th-tad' for sad"
    },
    'Stopping T': {
      pattern: 'Stopping T',
      example: "'tad' for sad"
    },
    // ...
  },
  // ...
}
```

---

## Sounds Covered

| Category | Sounds |
|---|---|
| Syllable patterns | `2 syllables`, `3 syllables` |
| Simple consonants | `P`, `B`, `M`, `T`, `D`, `K`, `G`, `L`, `R`, `S`, `Z`, `F`, `V`, `J`, `Ch`, `Sh`, `th` |
| Consonant clusters | `St-`, `Sp-`, `Sm-`, `Sn-`, `Sk-` |
| Final clusters | `Final P`, `Final T`, `Final K`, `Final -ts`, `Final -ps`, `Final -ks` |
| Vocalic R | `-er`, `-ar`, `-or` |

---

## Error Pattern Types

- **Omission** — sound dropped entirely
- **Stopping** — fricative replaced by a stop (e.g., T, D, K, G, P, B)
- **Fronting** — back sound replaced by a front sound
- **Backing** — front sound replaced by a back sound
- **Gliding** — L or R replaced by W or Y
- **Nasalization** — air escapes through the nose
- **Frontal Lisp** — interdental distortion of S/Z
- **Lateral Lisp** — slushy distortion of S/Z
- **Weak Syllable Deletion** — unstressed syllable dropped
- **Syllable Addition** — extra syllable added
- **Vowelization** — vocalic R replaced by a vowel
- **Atypical Substitution** — unusual or uncategorized substitution
