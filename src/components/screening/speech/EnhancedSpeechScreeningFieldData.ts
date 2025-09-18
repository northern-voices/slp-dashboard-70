export const articulationSounds = [
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
  'Sm-',
  'Sn-',
  'Sk-',
  'Final -ts',
  'Final -ps',
  'Final -ks',
  'K',
  'G',
  'T',
  'D',
  'L',
  'R',
  'S',
  'Z',
  'Ch',
  'Sh',
  'J',
  'F',
  'V',
  '-er',
  '-ar',
  '-or',
  'th',
]

export const soundErrorPatterns = {
  '2 syllables': {
    patterns: [
      { value: 'Weak Syllable Deletion', display: 'Weak Syllable Deletion' },
      { value: 'Syllable Addition', display: 'Syllable Addition' },
    ],
    word: 'Apple',
  },
  '3 syllables': {
    patterns: [
      { value: 'Weak Syllable Deletion', display: 'Weak Syllable Deletion' },
      { value: 'Syllable Addition', display: 'Syllable Addition' },
    ],
    word: 'Butterfly',
  },
  P: {
    patterns: [
      { value: 'Omission', display: 'Omission' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Pig',
  },
  B: {
    patterns: [
      { value: 'Omission', display: 'Omission' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Bear',
  },
  M: {
    patterns: [
      { value: 'Omission', display: 'Omission' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Moon',
  },
  'Final P': {
    patterns: [
      { value: 'Omission', display: 'Omission' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Soap',
  },
  'Final T': {
    patterns: [
      { value: 'Omission', display: 'Omission' },
      { value: 'Backing', display: 'Backing' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Hat',
  },
  'Final K': {
    patterns: [
      { value: 'Omission', display: 'Omission' },
      { value: 'Fronting', display: 'Fronting' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Book',
  },
  'St-': {
    patterns: [
      { value: 'Omits S', display: 'Omits S [-tar]' },
      { value: 'Omits T', display: 'Omits T [S-ar]' },
      { value: 'Omits ST', display: 'Omits ST [-ar]' },
      { value: 'Frontal Lisp', display: 'Frontal Lisp' },
      { value: 'Lateral Lisp', display: 'Lateral Lisp' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Backing', display: 'Backing' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Star',
  },
  'Sp-': {
    patterns: [
      { value: 'Omits S', display: 'Omits S [-poon]' },
      { value: 'Omits P', display: 'Omits P [S-oon]' },
      { value: 'Omits SP', display: 'Omits SP [-oon]' },
      { value: 'Frontal Lisp', display: 'Frontal Lisp' },
      { value: 'Lateral Lisp', display: 'Lateral Lisp' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Spoon',
  },
  'Sm-': {
    patterns: [
      { value: 'Omits S', display: 'Omits S [-moke]' },
      { value: 'Omits M', display: 'Omits M [S-oke]' },
      { value: 'Omits SM', display: 'Omits SM [-oke]' },
      { value: 'Frontal Lisp', display: 'Frontal Lisp' },
      { value: 'Lateral Lisp', display: 'Lateral Lisp' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Smoke',
  },
  'Sn-': {
    patterns: [
      { value: 'Omits S', display: 'Omits S [-now]' },
      { value: 'Omits N', display: 'Omits N [S-ow]' },
      { value: 'Omits SN', display: 'Omits SN [-ow]' },
      { value: 'Frontal Lisp', display: 'Frontal Lisp' },
      { value: 'Lateral Lisp', display: 'Lateral Lisp' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Snow',
  },
  'Sk-': {
    patterns: [
      { value: 'Omits S', display: 'Omits S [-ky]' },
      { value: 'Omits K', display: 'Omits K [S-y]' },
      { value: 'Omits SK', display: 'Omits SK [-y]' },
      { value: 'Frontal Lisp', display: 'Frontal Lisp' },
      { value: 'Lateral Lisp', display: 'Lateral Lisp' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Fronting', display: 'Fronting' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Sky',
  },
  'Final -ts': {
    patterns: [
      { value: 'Omits S', display: 'Omits S [Boot-]' },
      { value: 'Omits T', display: 'Omits T [Boo-s]' },
      { value: 'Omits TS', display: 'Omits TS [Boo-]' },
      { value: 'Frontal Lisp', display: 'Frontal Lisp' },
      { value: 'Lateral Lisp', display: 'Lateral Lisp' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Backing', display: 'Backing' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Boots',
  },
  'Final -ps': {
    patterns: [
      { value: 'Omits S', display: 'Omits S [Chip-]' },
      { value: 'Omits P', display: 'Omits P [Chi-s]' },
      { value: 'Omits PS', display: 'Omits PS [Chi-]' },
      { value: 'Frontal Lisp', display: 'Frontal Lisp' },
      { value: 'Lateral Lisp', display: 'Lateral Lisp' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Chips',
  },
  'Final -ks': {
    patterns: [
      { value: 'Omits S', display: 'Omits S [Bike-]' },
      { value: 'Omits K', display: 'Omits K [Bike-s]' },
      { value: 'Omits KS', display: 'Omits KS [Bike]' },
      { value: 'Frontal Lisp', display: 'Frontal Lisp' },
      { value: 'Lateral Lisp', display: 'Lateral Lisp' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Fronting', display: 'Fronting' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Bikes',
  },
  K: {
    patterns: [
      { value: 'Fronting', display: 'Fronting T' },
      { value: 'Omission', display: 'Omission' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Cookie',
  },
  G: {
    patterns: [
      { value: 'Fronting', display: 'Fronting G' },
      { value: 'Omission', display: 'Omission' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Girl',
  },
  T: {
    patterns: [
      { value: 'Backing', display: 'Backing K' },
      { value: 'Omission', display: 'Omission' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Two',
  },
  D: {
    patterns: [
      { value: 'Backing', display: 'Backing G' },
      { value: 'Omission', display: 'Omission' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Dance',
  },
  L: {
    patterns: [
      { value: 'Gliding w', display: "Gliding 'W'" },
      { value: 'Gliding y', display: "Gliding 'Y'" },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Light',
  },
  R: {
    patterns: [
      { value: 'Gliding w', display: "Gliding 'W'" },
      { value: 'Gliding y', display: "Gliding 'Y'" },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Rain',
  },
  S: {
    patterns: [
      { value: 'Stopping', display: 'Stopping' },
      { value: 'Frontal Lisp', display: 'Frontal Lisp' },
      { value: 'Lateral Lisp', display: 'Lateral Lisp' },
      { value: 'Omission', display: 'Omission' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Sad',
  },
  Z: {
    patterns: [
      { value: 'Stopping', display: 'Stopping' },
      { value: 'Sibilant S', display: 'Sibilant S' },
      { value: 'Frontal Lisp', display: 'Frontal Lisp' },
      { value: 'Lateral Lisp', display: 'Lateral Lisp' },
      { value: 'Omission', display: 'Omission' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Zombie',
  },
  Ch: {
    patterns: [
      { value: 'Stopping', display: 'Stopping' },
      { value: 'Lateral Lisp', display: 'Lateral Lisp' },
      { value: 'Omission', display: 'Omission' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Chicken',
  },
  Sh: {
    patterns: [
      { value: 'Stopping', display: 'Stopping' },
      { value: 'Sibilant S', display: 'Sibilant S' },
      { value: 'Lateral Lisp', display: 'Lateral Lisp' },
      { value: 'Omission', display: 'Omission' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Shoe',
  },
  J: {
    patterns: [
      { value: 'Stopping', display: 'Stopping' },
      { value: 'Lateral Lisp', display: 'Lateral Lisp' },
      { value: 'Omission', display: 'Omission' },
      { value: 'Nasalization', display: 'Nasalization' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Juice',
  },
  F: {
    patterns: [
      { value: 'Stopping', display: 'Stopping' },
      { value: 'Omission', display: 'Omission' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Fish',
  },
  V: {
    patterns: [
      { value: 'Stopping', display: 'Stopping' },
      { value: 'Omission', display: 'Omission' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Volcano',
  },
  '-er': {
    patterns: [
      { value: 'Vowelization', display: 'Vowelization (uh)' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Flower',
  },
  '-ar': {
    patterns: [
      { value: 'Vowelization w', display: 'Vowelization w (aw)' },
      { value: 'Vowelization y', display: 'Vowelization y' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Car',
  },
  '-or': {
    patterns: [
      { value: 'Vowelization oh/w', display: 'Vowelization (oh/w)' },
      { value: 'Vowelization y', display: 'Vowelization (y)' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Door',
  },
  th: {
    patterns: [
      { value: 'Stopping', display: 'Stopping' },
      { value: 'Sibilant Substitution (F)', display: 'Sibilant (F)' },
      { value: 'Sibilant Substitution (S)', display: 'Sibilant (S)' },
      { value: 'Omission', display: 'Omission' },
      { value: 'Other', display: 'Other' },
    ],
    word: 'Thumb',
  },
}

// Stopping sound options for sounds that have "Stopping" pattern
export const stoppingSoundOptions = ['P', 'B', 'T', 'D', 'K', 'G']

export const areasOfConcern = [
  'Language Comprehension',
  'Language Expression',
  'Pragmatics/Social Communication',
  'Fluency',
  'Suspected CAS',
  'Reluctant Speaking',
  'Voice',
  'Literacy',
  'Cleft Lip / Palate',
  'Known / Pending Diagnoses',
]
