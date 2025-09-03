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
    patterns: ['Weak Syllable Deletion', 'Syllable Addition'],
    word: 'Apple',
  },
  '3 syllables': {
    patterns: ['Weak Syllable Deletion', 'Syllable Addition'],
    word: 'Butterfly',
  },
  P: {
    patterns: ['Omission', 'Nasalization', 'Other'],
    word: 'Pig',
  },
  B: {
    patterns: ['Omission', 'Nasalization', 'Other'],
    word: 'Bear',
  },
  M: {
    patterns: ['Omission', 'Other'],
    word: 'Moon',
  },
  'Final P': {
    patterns: ['Omission', 'Nasalization', 'Other'],
    word: 'Soap',
  },
  'Final T': {
    patterns: ['Omission', 'Backing', 'Nasalization', 'Other'],
    word: 'Hat',
  },
  'Final K': {
    patterns: ['Omission', 'Fronting', 'Nasalization', 'Other'],
    word: 'Book',
  },
  'St-': {
    patterns: [
      'Omits S',
      'Omits T',
      'Omits ST',
      'Frontal Lisp',
      'Lateral Lisp',
      'Nasalization',
      'Backing',
      'Other',
    ],
    word: 'Star',
  },
  'Sp-': {
    patterns: [
      'Omits S',
      'Omits P',
      'Omits SP',
      'Frontal Lisp',
      'Lateral Lisp',
      'Nasalization',
      'Other',
    ],
    word: 'Spoon',
  },
  'Sm-': {
    patterns: [
      'Omits S',
      'Omits M',
      'Omits SM',
      'Frontal Lisp',
      'Lateral Lisp',
      'Nasalization',
      'Other',
    ],
    word: 'Smoke',
  },
  'Sn-': {
    patterns: [
      'Omits S',
      'Omits N',
      'Omits SN',
      'Frontal Lisp',
      'Lateral Lisp',
      'Nasalization',
      'Other',
    ],
    word: 'Snow',
  },
  'Sk-': {
    patterns: [
      'Omits S',
      'Omits K',
      'Omits SK',
      'Frontal Lisp',
      'Lateral Lisp',
      'Nasalization',
      'Fronting',
      'Other',
    ],
    word: 'Sky',
  },
  'Final -ts': {
    patterns: [
      'Omits S',
      'Omits T',
      'Omits TS',
      'Frontal Lisp',
      'Lateral Lisp',
      'Nasalization',
      'Backing',
      'Other',
    ],
    word: 'Boots',
  },
  'Final -ps': {
    patterns: [
      'Omits S',
      'Omits P',
      'Omits PS',
      'Frontal Lisp',
      'Lateral Lisp',
      'Nasalization',
      'Other',
    ],
    word: 'Chips',
  },
  'Final -ks': {
    patterns: [
      'Omits K',
      'Omits S',
      'Omits KS',
      'Frontal Lisp',
      'Lateral Lisp',
      'Nasalization',
      'Fronting',
      'Other',
    ],
    word: 'Bikes',
  },
  K: {
    patterns: ['Fronting', 'Omission', 'Nasalization', 'Other'],
    word: 'Cookie',
  },
  G: {
    patterns: ['Fronting', 'Omission', 'Nasalization', 'Other'],
    word: 'Girl',
  },
  T: {
    patterns: ['Backing', 'Omission', 'Nasalization', 'Other'],
    word: 'Two',
  },
  D: {
    patterns: ['Backing', 'Omission', 'Nasalization', 'Other'],
    word: 'Dance',
  },
  L: {
    patterns: ['Gliding w', 'Gliding y', 'Other'],
    word: 'Light',
  },
  R: {
    patterns: ['Gliding w', 'Gliding y', 'Other'],
    word: 'Rain',
  },
  S: {
    patterns: ['Stopping', 'Frontal Lisp', 'Lateral Lisp', 'Omission', 'Nasalization', 'Other'],
    word: 'Sad',
  },
  Z: {
    patterns: ['Stopping', 'Frontal Lisp', 'Lateral Lisp', 'Omission', 'Nasalization', 'Other'],
    word: 'Zombie',
  },
  Ch: {
    patterns: ['Stopping', 'Lateral Lisp', 'Omission', 'Nasalization', 'Other'],
    word: 'Chicken',
  },
  Sh: {
    patterns: ['Stopping', 'Lateral Lisp', 'Omission', 'Nasalization', 'Other'],
    word: 'Shoe',
  },
  J: {
    patterns: ['Stopping', 'Lateral Lisp', 'Omission', 'Nasalization', 'Other'],
    word: 'Juice',
  },
  F: {
    patterns: ['Omission', 'Stopping', 'Other'],
    word: 'Fish',
  },
  V: {
    patterns: ['Omission', 'Stopping', 'Other'],
    word: 'Volcano',
  },
  '-er': {
    patterns: ['Vowelization', 'Other'],
    word: 'Flower',
  },
  '-ar': {
    patterns: ['Vowelization w', 'Vowelization y', 'Other'],
    word: 'Car',
  },
  '-or': {
    patterns: ['Vowelization oh/w', 'Vowelization y', 'Other'],
    word: 'Door',
  },
  th: {
    patterns: [
      'Stopping',
      'Sibilant Substitution (S)',
      'Sibilant Substitution (F)',
      'Omission',
      'Other',
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
