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
}

interface ReclassificationRule {
  // any of these sounds showing any of triggerPatterns activates the rule
  triggerSounds: string[]
  triggerPatterns: string[]
  // these sounds, if present in error, get deferred to Level 2 once triggered
  deferredSounds: string[]
}

// Same shape for all three cases: a base phoneme's own errors stay wherever they're
// normally classified, but they push their blends/clusters into Level 2 once there's
// evidence of the underlying process (fronting, backing, or a lisp) affecting that
// sound family - so the student practices the simpler form first.
const RECLASSIFICATION_RULES: ReclassificationRule[] = [
  {
    // K-fronting family (K/G produced too far forward, e.g. as T/D)
    triggerSounds: ['K', 'G', 'Final K', 'Sk-', 'Final -ks'],
    triggerPatterns: ['Fronting'],
    deferredSounds: ['Sk-', 'Final -ks'],
  },
  {
    // T-backing family (T/D produced too far back, e.g. as K/G)
    triggerSounds: ['T', 'D', 'Final T', 'St-', 'Final -ts'],
    triggerPatterns: ['Backing'],
    deferredSounds: ['St-', 'Final -ts'],
  },
  {
    // Frontal/lateral lisp family
    triggerSounds: ['S', 'Z', 'St-', 'Sp-', 'Sm-', 'Sn-', 'Sk-', 'Final -ts', 'Final -ps', 'Final -ks'],
    triggerPatterns: ['Frontal Lisp', 'Lateral Lisp'],
    deferredSounds: ['St-', 'Sp-', 'Sm-', 'Sn-', 'Sk-', 'Final -ts', 'Final -ps', 'Final -ks'],
  },
]

// Classifies every sound actually in error into Level 1 or Level 2, applying the
// reclassification rules on top of the static primary/secondary lists. Only sounds
// present in `soundErrors` appear in the result.
export function classifySoundErrors(soundErrors: SoundErrorLike[]): Map<string, GoalSheetLevel> {
  const levels = new Map<string, GoalSheetLevel>()

  for (const error of soundErrors) {
    if (PRIMARY_SOUNDS.includes(error.sound)) levels.set(error.sound, 1)
    else if (SECONDARY_SOUNDS.includes(error.sound)) levels.set(error.sound, 2)
  }

  for (const rule of RECLASSIFICATION_RULES) {
    const isTriggered = soundErrors.some(
      e =>
        rule.triggerSounds.includes(e.sound) &&
        (e.errorPatterns || []).some(p => rule.triggerPatterns.includes(p)),
    )
    if (!isTriggered) continue

    for (const sound of rule.deferredSounds) {
      if (levels.has(sound)) levels.set(sound, 2)
    }
  }

  return levels
}
