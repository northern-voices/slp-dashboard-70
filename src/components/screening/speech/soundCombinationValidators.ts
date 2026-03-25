export function isValidStCombination(patterns: string[]): boolean {
  if (patterns.length === 0) return true
  if (patterns.length === 1) return true

  const hasOmitsST = patterns.includes('Omits ST')
  if (hasOmitsST && patterns.length > 1) return false

  const hasClusterReductionS = patterns.includes('Omits S')
  const hasClusterReductionT = patterns.includes('Omits T')
  const hasFrontalLisp = patterns.includes('Frontal Lisp')
  const hasLateralLisp = patterns.includes('Lateral Lisp')
  const hasNasalization = patterns.includes('Nasalization')
  const hasBacking = patterns.includes('Backing')

  if (patterns.length === 2) {
    return (
      (hasClusterReductionS && hasBacking) ||
      (hasFrontalLisp && hasBacking) ||
      (hasLateralLisp && hasBacking) ||
      (hasClusterReductionS && hasNasalization) ||
      (hasClusterReductionT && hasFrontalLisp) ||
      (hasClusterReductionT && hasLateralLisp) ||
      (hasClusterReductionT && hasNasalization)
    )
  }

  return false
}

export function isValidSpCombination(patterns: string[]): boolean {
  if (patterns.length === 0) return true
  if (patterns.length === 1) return true

  const hasOmitsSP = patterns.includes('Omits SP')
  if (hasOmitsSP && patterns.length > 1) return false

  const hasClusterReductionS = patterns.includes('Omits S')
  const hasClusterReductionP = patterns.includes('Omits P')
  const hasFrontalLisp = patterns.includes('Frontal Lisp')
  const hasLateralLisp = patterns.includes('Lateral Lisp')
  const hasNasalization = patterns.includes('Nasalization')

  if (patterns.length === 2) {
    return (
      (hasClusterReductionS && hasNasalization) ||
      (hasClusterReductionP && hasFrontalLisp) ||
      (hasClusterReductionP && hasLateralLisp) ||
      (hasClusterReductionP && hasNasalization)
    )
  }

  return false
}

export function isValidSnCombination(patterns: string[]): boolean {
  if (patterns.length === 0) return true
  if (patterns.length === 1) return true

  const hasOmitsSN = patterns.includes('Omits SN')
  if (hasOmitsSN && patterns.length > 1) return false

  const hasClusterReductionS = patterns.includes('Omits S')
  const hasClusterReductionN = patterns.includes('Omits N')
  const hasFrontalLisp = patterns.includes('Frontal Lisp')
  const hasLateralLisp = patterns.includes('Lateral Lisp')
  const hasNasalization = patterns.includes('Nasalization')

  if (patterns.length === 2) {
    return (
      (hasClusterReductionS && hasNasalization) ||
      (hasClusterReductionN && hasNasalization) ||
      (hasClusterReductionN && hasFrontalLisp) ||
      (hasClusterReductionN && hasLateralLisp)
    )
  }

  return false
}

export function isValidSmCombination(patterns: string[]): boolean {
  if (patterns.length === 0) return true
  if (patterns.length === 1) return true

  const hasOmitsSM = patterns.includes('Omits SM')
  if (hasOmitsSM && patterns.length > 1) return false

  const hasClusterReductionS = patterns.includes('Omits S')
  const hasClusterReductionM = patterns.includes('Omits M')
  const hasFrontalLisp = patterns.includes('Frontal Lisp')
  const hasLateralLisp = patterns.includes('Lateral Lisp')
  const hasNasalization = patterns.includes('Nasalization')

  if (patterns.length === 2) {
    return (
      (hasClusterReductionS && hasNasalization) ||
      (hasClusterReductionM && hasNasalization) ||
      (hasClusterReductionM && hasFrontalLisp) ||
      (hasClusterReductionM && hasLateralLisp)
    )
  }

  return false
}

export function isValidSkCombination(patterns: string[]): boolean {
  if (patterns.length === 0) return true
  if (patterns.length === 1) return true

  const hasOmitsSK = patterns.includes('Omits SK')
  if (hasOmitsSK && patterns.length > 1) return false

  const hasClusterReductionS = patterns.includes('Omits S')
  const hasClusterReductionK = patterns.includes('Omits K')
  const hasFrontalLisp = patterns.includes('Frontal Lisp')
  const hasLateralLisp = patterns.includes('Lateral Lisp')
  const hasFronting = patterns.includes('Fronting')

  if (patterns.length === 2) {
    return (
      (hasFrontalLisp && hasFronting) ||
      (hasLateralLisp && hasFronting) ||
      (hasClusterReductionS && hasFronting) ||
      (hasClusterReductionK && hasFrontalLisp) ||
      (hasClusterReductionK && hasLateralLisp)
    )
  }

  return false
}

export function isValidFinalTsCombination(patterns: string[]): boolean {
  if (patterns.length === 0) return true
  if (patterns.length === 1) return true

  const hasOmitsTS = patterns.includes('Omits TS')
  if (hasOmitsTS && patterns.length > 1) return false

  const hasClusterReductionS = patterns.includes('Omits S')
  const hasClusterReductionT = patterns.includes('Omits T')
  const hasFrontalLisp = patterns.includes('Frontal Lisp')
  const hasLateralLisp = patterns.includes('Lateral Lisp')
  const hasBacking = patterns.includes('Backing')

  if (patterns.length === 2) {
    return (
      (hasClusterReductionS && hasBacking) ||
      (hasClusterReductionT && hasFrontalLisp) ||
      (hasClusterReductionT && hasLateralLisp)
    )
  }

  return false
}

export function isValidFinalPsCombination(patterns: string[]): boolean {
  if (patterns.length === 0) return true
  if (patterns.length === 1) return true

  const hasOmitsPS = patterns.includes('Omits PS')
  if (hasOmitsPS && patterns.length > 1) return false

  const hasClusterReductionP = patterns.includes('Omits P')
  const hasFrontalLisp = patterns.includes('Frontal Lisp')
  const hasLateralLisp = patterns.includes('Lateral Lisp')

  if (patterns.length === 2) {
    return (hasClusterReductionP && hasFrontalLisp) || (hasClusterReductionP && hasLateralLisp)
  }

  return false
}

export function isValidFinalKsCombination(patterns: string[]): boolean {
  if (patterns.length === 0) return true
  if (patterns.length === 1) return true

  const hasOmitsKS = patterns.includes('Omits KS')
  if (hasOmitsKS && patterns.length > 1) return false

  const hasClusterReductionK = patterns.includes('Omits K')
  const hasClusterReductionS = patterns.includes('Omits S')
  const hasFrontalLisp = patterns.includes('Frontal Lisp')
  const hasLateralLisp = patterns.includes('Lateral Lisp')
  const hasFronting = patterns.includes('Fronting')

  if (patterns.length === 2) {
    return (
      (hasClusterReductionK && hasFrontalLisp) ||
      (hasClusterReductionK && hasLateralLisp) ||
      (hasClusterReductionS && hasFronting)
    )
  }

  return false
}

export function isValidKGCombination(patterns: string[]): boolean {
  if (patterns.length === 0) return true
  if (patterns.length === 1) return true

  const hasFronting = patterns.includes('Fronting')
  const hasNasalization = patterns.includes('Nasalization')

  if (patterns.length === 2) {
    return hasFronting && hasNasalization
  }

  return false
}

export function isValidTDCombination(patterns: string[]): boolean {
  if (patterns.length === 0) return true
  if (patterns.length === 1) return true

  const hasBacking = patterns.includes('Backing')
  const hasNasalization = patterns.includes('Nasalization')

  if (patterns.length === 2) {
    return hasBacking && hasNasalization
  }

  return false
}

export function isValidLRCombination(patterns: string[]): boolean {
  if (patterns.length === 0) return true
  if (patterns.length === 1) return true

  return false
}

export function isValidSZCombination(patterns: string[]): boolean {
  if (patterns.length === 0) return true
  if (patterns.length === 1) return true

  if (patterns.length >= 2) {
    const hasOther = patterns.includes('Other')
    const hasOtherPatterns = patterns.some(p => p !== 'Other')
    if (hasOther && hasOtherPatterns) return false
    return true
  }

  return true
}

export function isValidArCombination(patterns: string[]): boolean {
  if (patterns.length === 0) return true
  if (patterns.length === 1) return true

  const hasVowelizationW = patterns.includes('Vowelization w')
  const hasVowelizationY = patterns.includes('Vowelization y')

  if (hasVowelizationW && hasVowelizationY) return false

  return true
}

export function isValidOrCombination(patterns: string[]): boolean {
  if (patterns.length === 0) return true
  if (patterns.length === 1) return true

  const hasVowelizationOhW = patterns.includes('Vowelization oh/w')
  const hasVowelizationY = patterns.includes('Vowelization y')

  if (hasVowelizationOhW && hasVowelizationY) return false

  return true
}
