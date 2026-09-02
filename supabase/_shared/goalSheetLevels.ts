// Level 1 = early-developing sounds, Level 2 = later-developing sounds (formerly
// called "Cycle 1"/"Cycle 2" - same underlying classification, renamed).
export const PRIMARY_SOUNDS = [
  '2 syllables',
  '3 syllables',
  'P',
  'B',
  'M',
  'Final P',
  'Final T',
  'Final K',
  'St-',
  'Sp-',
  'Sn-',
  'Sm-',
  'Sk-',
  'Final -ps',
  'Final -ts',
  'Final -ks',
  'K',
  'G',
  'T',
  'D',
  'S',
]

export const SECONDARY_SOUNDS = ['L', 'R', 'Z', 'Ch', 'J', 'Sh', 'F', 'V', '-ar', '-er', '-or', 'th']

export type GoalSheetLevel = 1 | 2

export interface SoundErrorLike {
  sound: string
  errorPatterns: string[]
  stimulabilityOptions?: string[]
}

// A base sound (T, K, S, ...) held back from deferring its blends because it
// hasn't reached Word yet - gets its own synthesized entry on the Level 2
// document instead, always shown at Word.
export interface EscalatedBaseSound {
  sound: string
  errorPatterns: string[]
  stimulability: 'word'
}

interface ReclassificationRule {
  // any of these sounds showing any of triggerPatterns activates the rule
  triggerSounds: string[]
  triggerPatterns: string[]
  // these sounds, if present in error, get deferred to Level 2 once triggered
  // (subject to the gateSounds check below)
  deferredSounds: string[]
  // the "base" sounds among triggerSounds whose own recorded stimulability
  // gates the deferral - excludes the blends themselves, since gating a blend
  // on its own stimulability doesn't make sense
  gateSounds: string[]
}

// Same shape for all three cases: a base phoneme's own errors stay wherever they're
// normally classified, but they push their blends/clusters into Level 2 once there's
// evidence of the underlying process (fronting, backing, or a lisp) affecting that
// sound family - so the student practices the simpler form first. That deferral is
// itself gated: the base sound(s) must have reached Word stimulability, otherwise
// the blend stays put and the base sound gets an extra Level 2 entry of its own
// (see classifySoundErrors below).
const RECLASSIFICATION_RULES: ReclassificationRule[] = [
  {
    // K-fronting family (K/G produced too far forward, e.g. as T/D)
    triggerSounds: ['K', 'G', 'Final K', 'Sk-', 'Final -ks'],
    triggerPatterns: ['Fronting'],
    deferredSounds: ['Sk-', 'Final -ks'],
    gateSounds: ['K', 'G', 'Final K'],
  },
  {
    // T-backing family (T/D produced too far back, e.g. as K/G)
    triggerSounds: ['T', 'D', 'Final T', 'St-', 'Final -ts'],
    triggerPatterns: ['Backing'],
    deferredSounds: ['St-', 'Final -ts'],
    gateSounds: ['T', 'D', 'Final T'],
  },
  {
    // Frontal/lateral lisp family
    triggerSounds: ['S', 'Z', 'St-', 'Sp-', 'Sm-', 'Sn-', 'Sk-', 'Final -ts', 'Final -ps', 'Final -ks'],
    triggerPatterns: ['Frontal Lisp', 'Lateral Lisp'],
    deferredSounds: ['St-', 'Sp-', 'Sm-', 'Sn-', 'Sk-', 'Final -ts', 'Final -ps', 'Final -ks'],
    gateSounds: ['S', 'Z'],
  },
]

const STIMULABILITY_RANK: Record<string, number> = {
  'non-stimulable': 0,
  sound: 1,
  word: 2,
  phrase: 3,
}
const WORD_RANK = STIMULABILITY_RANK.word

function stimulabilityRank(stimulabilityOptions: string[] | undefined): number {
  const raw = (stimulabilityOptions?.[0] || 'word').toLowerCase()
  return STIMULABILITY_RANK[raw] ?? WORD_RANK
}

// Mirrors the frontend's GRADE_MAPPING (src/constants/app.ts) developmental order,
// plus "K" - a real grade_level value in the data that isn't in that list either.
// Kept as a separate copy here since this Deno function can't import from src/.
const GRADE_ORDER = [
  'Headstart',
  'Nursery',
  'Pre-K',
  'K4',
  'K5',
  'Kindergarten',
  'K/1',
  'K',
  '1',
  '1/2',
  '2',
  '2/3',
  '3',
  '3/4',
  '4',
  '4/5',
  '5',
  '5/6',
  '6',
  '6/7',
  '7',
  '7/8',
  '8',
  '8/9',
  '9',
  '9/10',
  '10',
  '10/11',
  '11',
  '11/12',
  '12',
]

// Real grade_level values that aren't in GRADE_ORDER but mean the same
// developmental stage as one that is - normalized before ranking rather than
// inserted as separate array entries, so they can't accidentally rank as
// younger/older than the grade they're actually equivalent to.
const GRADE_ALIASES: Record<string, string> = {
  '1A': '1',
  '1B': '1',
  'Pre-': 'Pre-K',
}

const GRADE_1_INDEX = GRADE_ORDER.indexOf('1')

// Unrecognized/missing grade values (blank, "Staff", anything not in the list
// above) are treated as NOT grade-1+ - a safe default that leaves classification
// untouched instead of guessing.
function isGradeOneOrOlder(grade: string | undefined | null): boolean {
  if (!grade) return false
  const normalized = GRADE_ALIASES[grade] || grade
  const index = GRADE_ORDER.indexOf(normalized)
  return index !== -1 && index >= GRADE_1_INDEX
}

export interface ClassificationResult {
  levels: Map<string, GoalSheetLevel>
  // Base sounds held back from deferring their blends because they haven't
  // reached Word yet - only ever populated when generating Level 2.
  escalatedBaseSounds: EscalatedBaseSound[]
  // Blends that successfully deferred to Level 2 via a reclassification rule -
  // these always display at Word once unlocked, regardless of whatever their
  // own stimulability was actually recorded as on the screening.
  forcedWordSounds: Set<string>
}

// Classifies every sound actually in error into Level 1 or Level 2, applying the
// reclassification rules on top of the static primary/secondary lists. Only sounds
// present in `soundErrors` appear in the result.
//
// Reclassification is gated on the triggering base sound(s) having reached Word
// stimulability. A blend can be targeted by more than one rule at once (e.g. St-
// by both T-backing and an S-lisp) - it only defers to Level 2 once EVERY active
// rule targeting it has its gate met. A rule with no separate base-sound error
// entry to check (e.g. only the blend itself carries the pattern) has nothing to
// gate on, so it defers unconditionally, same as before this feature existed.
//
// Grade-1+ override: a student old enough to be past the early-developing sounds
// who nonetheless has ZERO Level 1 sound errors (only later-developing sounds in
// error) gets all of those sounds relabeled Level 1 - for this student, that's
// genuinely their starting point, not a "later" stage they've already earned.
// Students with at least one real Level 1 sound error are unaffected.
export function classifySoundErrors(
  soundErrors: SoundErrorLike[],
  grade?: string | null,
): ClassificationResult {
  const levels = new Map<string, GoalSheetLevel>()

  for (const error of soundErrors) {
    if (PRIMARY_SOUNDS.includes(error.sound)) levels.set(error.sound, 1)
    else if (SECONDARY_SOUNDS.includes(error.sound)) levels.set(error.sound, 2)
  }

  const activeRules: {
    rule: ReclassificationRule
    gateMet: boolean
    gateSoundErrors: SoundErrorLike[]
  }[] = []

  for (const rule of RECLASSIFICATION_RULES) {
    const isTriggered = soundErrors.some(
      e =>
        rule.triggerSounds.includes(e.sound) &&
        (e.errorPatterns || []).some(p => rule.triggerPatterns.includes(p)),
    )
    if (!isTriggered) continue

    const gateSoundErrors = soundErrors.filter(e => rule.gateSounds.includes(e.sound))
    const gateMet =
      gateSoundErrors.length === 0 ||
      gateSoundErrors.every(e => stimulabilityRank(e.stimulabilityOptions) >= WORD_RANK)

    activeRules.push({ rule, gateMet, gateSoundErrors })
  }

  const forcedWordSounds = new Set<string>()
  const deferredCandidates = new Set(activeRules.flatMap(r => r.rule.deferredSounds))
  for (const sound of deferredCandidates) {
    const targetingRules = activeRules.filter(r => r.rule.deferredSounds.includes(sound))
    const allGatesMet = targetingRules.every(r => r.gateMet)
    if (allGatesMet && levels.has(sound)) {
      levels.set(sound, 2)
      forcedWordSounds.add(sound)
    }
  }

  const escalatedBaseSounds: EscalatedBaseSound[] = []
  const seenEscalated = new Set<string>()
  for (const { rule, gateMet, gateSoundErrors } of activeRules) {
    if (gateMet) continue
    for (const e of gateSoundErrors) {
      if (stimulabilityRank(e.stimulabilityOptions) >= WORD_RANK) continue
      if (seenEscalated.has(e.sound)) continue
      seenEscalated.add(e.sound)
      escalatedBaseSounds.push({
        sound: e.sound,
        errorPatterns: (e.errorPatterns || []).filter(p => rule.triggerPatterns.includes(p)),
        stimulability: 'word',
      })
    }
  }

  const hasLevel1 = [...levels.values()].some(level => level === 1)
  const hasLevel2 = [...levels.values()].some(level => level === 2)
  if (!hasLevel1 && hasLevel2 && isGradeOneOrOlder(grade)) {
    for (const [sound, level] of levels) {
      if (level === 2) levels.set(sound, 1)
    }
  }

  return { levels, escalatedBaseSounds, forcedWordSounds }
}
