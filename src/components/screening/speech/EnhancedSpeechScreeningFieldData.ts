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
    patterns: ['Omission', 'Backing', 'Nasalization', 'Other'],
    word: 'Book',
  },
  'St-': {
    patterns: [
      'Cluster Reduction (Omits S)',
      'Cluster Reduction (Omits T)',
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
      'Cluster Reduction (Omits S)',
      'Cluster Reduction (Omits P)',
      'Frontal Lisp',
      'Lateral Lisp',
      'Nasalization',
      'Other',
    ],
    word: 'Spoon',
  },
  'Sm-': {
    patterns: [
      'Cluster Reduction (Omits S)',
      'Cluster Reduction (Omits M)',
      'Frontal Lisp',
      'Lateral Lisp',
      'Nasalization',
      'Other',
    ],
    word: 'Smoke',
  },
  'Sn-': {
    patterns: [
      'Cluster Reduction (Omits S)',
      'Cluster Reduction (Omits N)',
      'Frontal Lisp',
      'Lateral Lisp',
      'Nasalization',
      'Other',
    ],
    word: 'Snow',
  },
  'Sk-': {
    patterns: [
      'Cluster Reduction (Omits S)',
      'Cluster Reduction (Omits K)',
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
      'Cluster Reduction (Omits S)',
      'Cluster Reduction (Omits T)',
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
      'Cluster Reduction (Omits P)',
      'Cluster Reduction (Omits S)',
      'Frontal Lisp',
      'Lateral Lisp',
      'Nasalization',
      'Other',
    ],
    word: 'Chips',
  },
  'Final -ks': {
    patterns: [
      'Cluster Reduction (Omits K)',
      'Cluster Reduction (Omits S)',
      'Frontal Lisp',
      'Lateral Lisp',
      'Nasalization',
      'Fronting',
      'Other',
    ],
    word: 'Bikes',
  },
  K: {
    patterns: ['Fronting', 'Omission', 'Other'],
    word: 'Cookie',
  },
  G: {
    patterns: ['Fronting', 'Omission', 'Other'],
    word: 'Girl',
  },
  T: {
    patterns: ['Backing', 'Omission', 'Other'],
    word: 'Two',
  },
  D: {
    patterns: ['Backing', 'Omission', 'Other'],
    word: 'Dance',
  },
  L: {
    patterns: ["Gliding 'w'", "Gliding 'y'", 'Other'],
    word: 'Light',
  },
  R: {
    patterns: ["Gliding 'w'", "Gliding 'y'", 'Other'],
    word: 'Rain',
  },
  S: {
    patterns: ['Stopping', 'Frontal Lisp', 'Lateral Lisp', 'Omission', 'Other'],
    word: 'Sad',
  },
  Z: {
    patterns: ['Stopping', 'Frontal Lisp', 'Lateral Lisp', 'Omission', 'Other'],
    word: 'Zombie',
  },
  Ch: {
    patterns: ['Stopping', 'Lateral Lisp', 'Omission', 'Other'],
    word: 'Chicken',
  },
  Sh: {
    patterns: ['Stopping', 'Lateral Lisp', 'Omission', 'Other'],
    word: 'Shoe',
  },
  J: {
    patterns: ['Stopping', 'Lateral Lisp', 'Omission', 'Other'],
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
    patterns: ['Vowelization', 'Other'],
    word: 'Car',
  },
  '-or': {
    patterns: ['Vowelization', 'Other'],
    word: 'Door',
  },
  th: {
    patterns: ['Stopping', 'Sibilant error (s, f)', 'Omission', 'Other'],
    word: 'Thumb',
  },
}

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
