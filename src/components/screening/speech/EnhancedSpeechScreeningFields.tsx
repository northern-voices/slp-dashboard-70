import React, { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  articulationSounds,
  soundErrorPatterns,
  areasOfConcern,
  stoppingSoundOptions,
} from './EnhancedSpeechScreeningFieldData'

interface EnhancedSpeechScreeningFieldsProps {
  form: UseFormReturn<{
    articulation?: {
      soundErrors: Array<{
        sound: string
        errorPatterns: string[]
        stoppingSounds?: string[]
        notes: string
        otherNotes?: string
      }>
      articulationNotes: string
    }
    general_articulation_notes?: string
    speech_screen_result?: string
    vocabulary_support_recommended?: boolean
    qualifies_for_speech_program?: boolean
    areasOfConcern?: Record<string, string | null>
  }>
}

const EnhancedSpeechScreeningFields = ({ form }: EnhancedSpeechScreeningFieldsProps) => {
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [selectedSounds, setSelectedSounds] = useState<string[]>([])
  const [soundNotes, setSoundNotes] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [selectedErrorPatterns, setSelectedErrorPatterns] = useState<Record<string, string[]>>({})
  const [selectedStoppingSounds, setSelectedStoppingSounds] = useState<Record<string, string[]>>({})

  // Helper function to validate St- combinations
  const isValidStCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // Valid combinations for St-:
    // 1. Cluster Reduction (Omits S) & Backing
    // 2. Frontal Lisp & Backing
    // 3. Lateral Lisp & Backing
    // 4. Cluster Reduction (Omits S) & Nasalization
    // 5. Cluster Reduction (Omits T) & Frontal Lisp
    // 6. Cluster Reduction (Omits T) & Lateral Lisp
    // 7. Cluster Reduction (Omits T) & Nasalization

    const hasClusterReductionS = patterns.includes('Cluster Reduction (Omits S)')
    const hasClusterReductionT = patterns.includes('Cluster Reduction (Omits T)')
    const hasFrontalLisp = patterns.includes('Frontal Lisp')
    const hasLateralLisp = patterns.includes('Lateral Lisp')
    const hasNasalization = patterns.includes('Nasalization')
    const hasBacking = patterns.includes('Backing')

    // Check if it's a valid 2-pattern combination
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

    // No combinations of 3 or more patterns are allowed
    return false
  }

  // Helper function to validate Sp- combinations
  const isValidSpCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // Valid combinations for Sp-:
    // 1. Cluster Reduction (Omits S) & Nasalization
    // 2. Cluster Reduction (Omits P) & Frontal Lisp
    // 3. Cluster Reduction (Omits P) & Lateral Lisp
    // 4. Cluster Reduction (Omits P) & Nasalization

    const hasClusterReductionS = patterns.includes('Cluster Reduction (Omits S)')
    const hasClusterReductionP = patterns.includes('Cluster Reduction (Omits P)')
    const hasFrontalLisp = patterns.includes('Frontal Lisp')
    const hasLateralLisp = patterns.includes('Lateral Lisp')
    const hasNasalization = patterns.includes('Nasalization')

    // Check if it's a valid 2-pattern combination
    if (patterns.length === 2) {
      return (
        (hasClusterReductionS && hasNasalization) ||
        (hasClusterReductionP && hasFrontalLisp) ||
        (hasClusterReductionP && hasLateralLisp) ||
        (hasClusterReductionP && hasNasalization)
      )
    }

    // No combinations of 3 or more patterns are allowed
    return false
  }

  // Helper function to validate Sn- combinations
  const isValidSnCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // Valid combinations for Sn-:
    // 1. Cluster Reduction (Omits S) & Nasalization
    // 2. Cluster Reduction (Omits N) & Nasalization
    // 3. Cluster Reduction (Omits N) & Frontal Lisp
    // 4. Cluster Reduction (Omits N) & Lateral Lisp

    const hasClusterReductionS = patterns.includes('Cluster Reduction (Omits S)')
    const hasClusterReductionN = patterns.includes('Cluster Reduction (Omits N)')
    const hasFrontalLisp = patterns.includes('Frontal Lisp')
    const hasLateralLisp = patterns.includes('Lateral Lisp')
    const hasNasalization = patterns.includes('Nasalization')

    // Check if it's a valid 2-pattern combination
    if (patterns.length === 2) {
      return (
        (hasClusterReductionS && hasNasalization) ||
        (hasClusterReductionN && hasNasalization) ||
        (hasClusterReductionN && hasFrontalLisp) ||
        (hasClusterReductionN && hasLateralLisp)
      )
    }

    // No combinations of 3 or more patterns are allowed
    return false
  }

  // Helper function to validate Sm- combinations
  const isValidSmCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // Valid combinations for Sm-:
    // 1. Cluster Reduction (Omits S) & Nasalization
    // 2. Cluster Reduction (Omits M) & Nasalization
    // 3. Cluster Reduction (Omits M) & Frontal Lisp
    // 4. Cluster Reduction (Omits M) & Lateral Lisp

    const hasClusterReductionS = patterns.includes('Cluster Reduction (Omits S)')
    const hasClusterReductionM = patterns.includes('Cluster Reduction (Omits M)')
    const hasFrontalLisp = patterns.includes('Frontal Lisp')
    const hasLateralLisp = patterns.includes('Lateral Lisp')
    const hasNasalization = patterns.includes('Nasalization')

    // Check if it's a valid 2-pattern combination
    if (patterns.length === 2) {
      return (
        (hasClusterReductionS && hasNasalization) ||
        (hasClusterReductionM && hasNasalization) ||
        (hasClusterReductionM && hasFrontalLisp) ||
        (hasClusterReductionM && hasLateralLisp)
      )
    }

    // No combinations of 3 or more patterns are allowed
    return false
  }

  // Helper function to validate Sk- combinations
  const isValidSkCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // Valid combinations for Sk-:
    // 1. Frontal Lisp & Fronting
    // 2. Lateral Lisp & Fronting
    // 3. Cluster Reduction (Omits S) & Fronting
    // 4. Cluster Reduction (Omits K) & Frontal Lisp
    // 5. Cluster Reduction (Omits K) & Lateral Lisp

    const hasClusterReductionS = patterns.includes('Cluster Reduction (Omits S)')
    const hasClusterReductionK = patterns.includes('Cluster Reduction (Omits K)')
    const hasFrontalLisp = patterns.includes('Frontal Lisp')
    const hasLateralLisp = patterns.includes('Lateral Lisp')
    const hasFronting = patterns.includes('Fronting')

    // Check if it's a valid 2-pattern combination
    if (patterns.length === 2) {
      return (
        (hasFrontalLisp && hasFronting) ||
        (hasLateralLisp && hasFronting) ||
        (hasClusterReductionS && hasFronting) ||
        (hasClusterReductionK && hasFrontalLisp) ||
        (hasClusterReductionK && hasLateralLisp)
      )
    }

    // No combinations of 3 or more patterns are allowed
    return false
  }

  // Helper function to validate Final -ts combinations
  const isValidFinalTsCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // Valid combinations for Final -ts:
    // 1. Cluster Reduction (Omits S) & Backing
    // 2. Cluster Reduction (Omits T) & Frontal Lisp
    // 3. Cluster Reduction (Omits T) & Lateral Lisp

    const hasClusterReductionS = patterns.includes('Cluster Reduction (Omits S)')
    const hasClusterReductionT = patterns.includes('Cluster Reduction (Omits T)')
    const hasFrontalLisp = patterns.includes('Frontal Lisp')
    const hasLateralLisp = patterns.includes('Lateral Lisp')
    const hasBacking = patterns.includes('Backing')

    // Check if it's a valid 2-pattern combination
    if (patterns.length === 2) {
      return (
        (hasClusterReductionS && hasBacking) ||
        (hasClusterReductionT && hasFrontalLisp) ||
        (hasClusterReductionT && hasLateralLisp)
      )
    }

    // No combinations of 3 or more patterns are allowed
    return false
  }

  // Helper function to validate Final -ps combinations
  const isValidFinalPsCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // Valid combinations for Final -ps:
    // 1. Cluster Reduction (Omits P) & Frontal Lisp
    // 2. Cluster Reduction (Omits P) & Lateral Lisp

    const hasClusterReductionP = patterns.includes('Cluster Reduction (Omits P)')
    const hasFrontalLisp = patterns.includes('Frontal Lisp')
    const hasLateralLisp = patterns.includes('Lateral Lisp')

    // Check if it's a valid 2-pattern combination
    if (patterns.length === 2) {
      return (hasClusterReductionP && hasFrontalLisp) || (hasClusterReductionP && hasLateralLisp)
    }

    // No combinations of 3 or more patterns are allowed
    return false
  }

  // Helper function to validate Final -ks combinations
  const isValidFinalKsCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // Valid combinations for Final -ks:
    // 1. Cluster Reduction (Omits K) & Frontal Lisp
    // 2. Cluster Reduction (Omits K) & Lateral Lisp
    // 3. Cluster Reduction (Omits S) & Fronting

    const hasClusterReductionK = patterns.includes('Cluster Reduction (Omits K)')
    const hasClusterReductionS = patterns.includes('Cluster Reduction (Omits S)')
    const hasFrontalLisp = patterns.includes('Frontal Lisp')
    const hasLateralLisp = patterns.includes('Lateral Lisp')
    const hasFronting = patterns.includes('Fronting')

    // Check if it's a valid 2-pattern combination
    if (patterns.length === 2) {
      return (
        (hasClusterReductionK && hasFrontalLisp) ||
        (hasClusterReductionK && hasLateralLisp) ||
        (hasClusterReductionS && hasFronting)
      )
    }

    // No combinations of 3 or more patterns are allowed
    return false
  }

  // Helper function to validate K and G combinations
  const isValidKGCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // Valid combinations for K and G:
    // 1. Fronting & Nasalization can happen together
    // 2. Omission will be on its own (exclusive)

    const hasFronting = patterns.includes('Fronting')
    const hasNasalization = patterns.includes('Nasalization')
    const hasOmission = patterns.includes('Omission')

    // Check if it's a valid 2-pattern combination
    if (patterns.length === 2) {
      return hasFronting && hasNasalization
    }

    // No combinations of 3 or more patterns are allowed
    return false
  }

  // Helper function to validate T and D combinations
  const isValidTDCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // Valid combinations for T and D:
    // 1. Backing & Nasalization can happen together
    // 2. Omission will be on its own (exclusive)

    const hasBacking = patterns.includes('Backing')
    const hasNasalization = patterns.includes('Nasalization')
    const hasOmission = patterns.includes('Omission')

    // Check if it's a valid 2-pattern combination
    if (patterns.length === 2) {
      return hasBacking && hasNasalization
    }

    // No combinations of 3 or more patterns are allowed
    return false
  }

  // Helper function to validate L and R combinations
  const isValidLRCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // Valid combinations for L and R:
    // 1. W or Y is one or the other (mutually exclusive)
    // 2. No other combinations allowed

    const hasGlidingW = patterns.includes("Gliding 'w'")
    const hasGlidingY = patterns.includes("Gliding 'y'")

    // Check if it's a valid 2-pattern combination
    if (patterns.length === 2) {
      return false // No 2-pattern combinations allowed for L and R
    }

    // No combinations of 3 or more patterns are allowed
    return false
  }

  // Helper function to validate S, Z, Ch, Sh, J, F, V, th combinations
  const isValidSZCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // Valid combinations for S, Z, Ch, Sh, J, F, V, th:
    // Any patterns can be combined EXCEPT 'Other' which is exclusive
    // This allows multiple patterns to be selected together

    // Check if it's a valid combination (any length is allowed except 'Other' exclusivity)
    if (patterns.length >= 2) {
      // Only restriction: 'Other' cannot be combined with other patterns
      const hasOther = patterns.includes('Other')
      const hasOtherPatterns = patterns.some(p => p !== 'Other')

      if (hasOther && hasOtherPatterns) {
        return false // 'Other' is exclusive
      }

      return true // All other combinations are valid
    }

    return true
  }

  // Helper function to convert concern names to field names
  const getFieldName = (concern: string): string => {
    const fieldNameMap: Record<string, string> = {
      'Language Comprehension': 'language_comprehension',
      'Language Expression': 'language_expression',
      'Pragmatics/Social Communication': 'pragmatics_social_communication',
      Fluency: 'fluency',
      'Suspected CAS': 'suspected_cas',
      'Reluctant Speaking': 'reluctant_speaking',
      Voice: 'voice',
      Literacy: 'literacy',
      'Cleft Lip / Palate': 'cleft_lip_palate',
      'Known / Pending Diagnoses': 'known_pending_diagnoses',
    }
    return fieldNameMap[concern] || concern.toLowerCase().replace(/\s+/g, '_')
  }

  // Create nested structure for articulation data
  React.useEffect(() => {
    const soundErrorsData = selectedSounds.map(sound => ({
      sound: sound,
      errorPatterns: selectedErrorPatterns[sound] || [],
      stoppingSounds: selectedStoppingSounds[sound] || [],
      notes: notes[sound] || '',
      otherNotes: soundNotes[sound] || '',
    }))

    const articulationData = {
      soundErrors: soundErrorsData,
      articulationNotes: form.watch('general_articulation_notes') || '',
    }

    form.setValue('articulation', articulationData)
  }, [selectedSounds, selectedErrorPatterns, selectedStoppingSounds, soundNotes, notes, form])

  const handleConcernChange = (concern: string, checked: boolean) => {
    if (checked) {
      setSelectedConcerns([...selectedConcerns, concern])
    } else {
      setSelectedConcerns(selectedConcerns.filter(c => c !== concern))
    }
  }

  // Create areas of concern object structure
  React.useEffect(() => {
    const areasOfConcernData = {}
    areasOfConcern.forEach(concern => {
      const key = concern
        .toLowerCase()
        .replace(/\s+|\/|-/g, '_')
        .replace(/_+/g, '_')
        .replace(/_$/, '')
        .replace(/_pallet/, '_pallet')
      areasOfConcernData[key] = null
    })
    selectedConcerns.forEach(concern => {
      const key = concern
        .toLowerCase()
        .replace(/\s+|\/|-/g, '_')
        .replace(/_+/g, '_')
        .replace(/_$/, '')
        .replace(/_pallet/, '_pallet')
      const notes = form.watch(`areasOfConcern.${key}`) || ''
      areasOfConcernData[key] = notes || null
    })
    form.setValue('areasOfConcern', areasOfConcernData)
  }, [selectedConcerns, form])

  const handleSoundToggle = (sound: string) => {
    if (selectedSounds.includes(sound)) {
      setSelectedSounds(selectedSounds.filter(s => s !== sound))
      const newNotes = { ...soundNotes }
      delete newNotes[sound]
      setSoundNotes(newNotes)
      const newSoundNotes = { ...notes }
      delete newSoundNotes[sound]
      setNotes(newSoundNotes)

      // Clear stopping sounds for this sound
      const newStoppingSounds = { ...selectedStoppingSounds }
      delete newStoppingSounds[sound]
      setSelectedStoppingSounds(newStoppingSounds)
    } else {
      setSelectedSounds([...selectedSounds, sound])
    }
  }

  const handleSoundNoteChange = (sound: string, note: string) => {
    setSoundNotes({
      ...soundNotes,
      [sound]: note,
    })
  }

  const handleNoteChange = (sound: string, note: string) => {
    setNotes({
      ...notes,
      [sound]: note,
    })
  }

  const handleStoppingSoundChange = (sound: string, stoppingSound: string, checked: boolean) => {
    if (checked) {
      // When selecting a stopping sound, only allow one at a time
      setSelectedStoppingSounds({
        ...selectedStoppingSounds,
        [sound]: [stoppingSound],
      })
    } else {
      // When unchecking, clear the stopping sound
      setSelectedStoppingSounds({
        ...selectedStoppingSounds,
        [sound]: [],
      })
    }
  }

  const handleErrorPatternChange = (sound: string, pattern: string, checked: boolean) => {
    const currentPatterns = selectedErrorPatterns[sound] || []

    // Global rule: "Other" is always exclusive - when selected, it disables all other patterns
    if (pattern === 'Other') {
      if (checked) {
        // When selecting Other, clear all other patterns
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: ['Other'],
        })
      } else {
        // When unchecking Other, clear it
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: [],
        })
      }
      return // Exit early since Other handling is complete
    }

    // Handle Stopping pattern - clear stopping sounds when unchecked
    if (pattern === 'Stopping') {
      if (!checked) {
        // When unchecking Stopping, clear the stopping sounds
        const newStoppingSounds = { ...selectedStoppingSounds }
        delete newStoppingSounds[sound]
        setSelectedStoppingSounds(newStoppingSounds)
      }
    }

    // For 2 syllables and 3 syllables, implement mutual exclusion
    if (sound === '2 syllables' || sound === '3 syllables') {
      if (checked) {
        // When selecting a pattern, clear all others for this sound
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: [pattern],
        })
      } else {
        // When unchecking, clear the pattern
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: [],
        })
      }
    } else if (sound === 'P' || sound === 'B' || sound === 'Final P') {
      // For P, B, and Final P sounds: Omission is exclusive, Nasalization can be combined with other non-Omission patterns
      if (pattern === 'Omission') {
        if (checked) {
          // When selecting Omission, clear all other patterns
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: ['Omission'],
          })
        } else {
          // When unchecking Omission, clear it
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: currentPatterns.filter(p => p !== 'Omission'),
          })
        }
      } else {
        // For Nasalization pattern (Other is handled above)
        if (checked) {
          // If Omission is already selected, clear it first
          const patternsWithoutOmission = currentPatterns.filter(p => p !== 'Omission')
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: [...patternsWithoutOmission, pattern],
          })
        } else {
          // When unchecking, just remove the pattern
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: currentPatterns.filter(p => p !== pattern),
          })
        }
      }
    } else if (sound === 'M') {
      // For M sound: Omission is exclusive (Other is handled above)
      if (checked) {
        // When selecting a pattern, clear all others for this sound
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: [pattern],
        })
      } else {
        // When unchecking, clear the pattern
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: [],
        })
      }
    } else if (sound === 'Final T' || sound === 'Final K') {
      // For Final T and Final K: Omission is exclusive, Backing/Nasalization can be combined
      if (pattern === 'Omission') {
        if (checked) {
          // When selecting Omission, clear all other patterns
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: ['Omission'],
          })
        } else {
          // When unchecking Omission, clear it
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: currentPatterns.filter(p => p !== 'Omission'),
          })
        }
      } else {
        // For Backing and Nasalization patterns (Other is handled above)
        if (checked) {
          // If Omission is already selected, clear it first
          const patternsWithoutOmission = currentPatterns.filter(p => p !== 'Omission')
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: [...patternsWithoutOmission, pattern],
          })
        } else {
          // When unchecking, just remove the pattern
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: currentPatterns.filter(p => p !== pattern),
          })
        }
      }
    } else if (sound === 'St-') {
      // For St-: Allow specific combinations only
      if (checked) {
        // Check if this combination is valid
        const newPatterns = [...currentPatterns, pattern]
        if (isValidStCombination(newPatterns)) {
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: newPatterns,
          })
        }
      } else {
        // When unchecking, just remove the pattern
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: currentPatterns.filter(p => p !== pattern),
        })
      }
    } else if (sound === 'Sp-') {
      // For Sp-: Allow specific combinations only
      if (checked) {
        // Check if this combination is valid
        const newPatterns = [...currentPatterns, pattern]
        if (isValidSpCombination(newPatterns)) {
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: newPatterns,
          })
        }
      } else {
        // When unchecking, just remove the pattern
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: currentPatterns.filter(p => p !== pattern),
        })
      }
    } else if (sound === 'Sn-') {
      // For Sn-: Allow specific combinations only
      if (checked) {
        // Check if this combination is valid
        const newPatterns = [...currentPatterns, pattern]
        if (isValidSnCombination(newPatterns)) {
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: newPatterns,
          })
        }
      } else {
        // When unchecking, just remove the pattern
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: currentPatterns.filter(p => p !== pattern),
        })
      }
    } else if (sound === 'Sm-') {
      // For Sm-: Allow specific combinations only
      if (checked) {
        // Check if this combination is valid
        const newPatterns = [...currentPatterns, pattern]
        if (isValidSmCombination(newPatterns)) {
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: newPatterns,
          })
        }
      } else {
        // When unchecking, just remove the pattern
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: currentPatterns.filter(p => p !== pattern),
        })
      }
    } else if (sound === 'Sk-') {
      // For Sk-: Allow specific combinations only
      if (checked) {
        // Check if this combination is valid
        const newPatterns = [...currentPatterns, pattern]
        if (isValidSkCombination(newPatterns)) {
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: newPatterns,
          })
        }
      } else {
        // When unchecking, just remove the pattern
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: currentPatterns.filter(p => p !== pattern),
        })
      }
    } else if (sound === 'Final -ts') {
      // For Final -ts: Allow specific combinations only
      if (checked) {
        // Check if this combination is valid
        const newPatterns = [...currentPatterns, pattern]
        if (isValidFinalTsCombination(newPatterns)) {
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: newPatterns,
          })
        }
      } else {
        // When unchecking, just remove the pattern
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: currentPatterns.filter(p => p !== pattern),
        })
      }
    } else if (sound === 'Final -ps') {
      // For Final -ps: Allow specific combinations only
      if (checked) {
        // Check if this combination is valid
        const newPatterns = [...currentPatterns, pattern]
        if (isValidFinalPsCombination(newPatterns)) {
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: newPatterns,
          })
        }
      } else {
        // When unchecking, just remove the pattern
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: currentPatterns.filter(p => p !== pattern),
        })
      }
    } else if (sound === 'Final -ks') {
      // For Final -ks: Allow specific combinations only
      if (checked) {
        // Check if this combination is valid
        const newPatterns = [...currentPatterns, pattern]
        if (isValidFinalKsCombination(newPatterns)) {
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: newPatterns,
          })
        }
      } else {
        // When unchecking, just remove the pattern
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: currentPatterns.filter(p => p !== pattern),
        })
      }
    } else if (sound === 'K' || sound === 'G') {
      // For K and G: Allow specific combinations only
      if (checked) {
        // Check if this combination is valid
        const newPatterns = [...currentPatterns, pattern]
        if (isValidKGCombination(newPatterns)) {
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: newPatterns,
          })
        }
      } else {
        // When unchecking, just remove the pattern
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: currentPatterns.filter(p => p !== pattern),
        })
      }
    } else if (sound === 'T' || sound === 'D') {
      // For T and D: Allow specific combinations only
      if (checked) {
        // Check if this combination is valid
        const newPatterns = [...currentPatterns, pattern]
        if (isValidTDCombination(newPatterns)) {
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: newPatterns,
          })
        }
      } else {
        // When unchecking, just remove the pattern
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: currentPatterns.filter(p => p !== pattern),
        })
      }
    } else if (sound === 'L' || sound === 'R') {
      // For L and R: Allow only one pattern at a time (mutually exclusive)
      if (checked) {
        // When selecting a pattern, clear all others for this sound
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: [pattern],
        })
      } else {
        // When unchecking, clear the pattern
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: [],
        })
      }
    } else if (
      sound === 'S' ||
      sound === 'Z' ||
      sound === 'Ch' ||
      sound === 'Sh' ||
      sound === 'J' ||
      sound === 'F' ||
      sound === 'V' ||
      sound === 'th'
    ) {
      // For S, Z, Ch, Sh, J, F, V, th: Allow any combinations except 'Other' exclusivity
      if (checked) {
        // Check if this combination is valid
        const newPatterns = [...currentPatterns, pattern]
        if (isValidSZCombination(newPatterns)) {
          setSelectedErrorPatterns({
            ...selectedErrorPatterns,
            [sound]: newPatterns,
          })
        }
      } else {
        // When unchecking, just remove the pattern
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: currentPatterns.filter(p => p !== pattern),
        })
      }
    } else {
      // For other sounds, use the original logic but ensure Other is exclusive
      if (checked) {
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: [...currentPatterns, pattern],
        })
      } else {
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: currentPatterns.filter(p => p !== pattern),
        })
      }
    }
  }

  return (
    <div className='space-y-6'>
      {/* Articulation/Sound Production - Always Visible */}
      <Card>
        <CardHeader>
          <CardTitle>Articulation</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Articulation Sounds */}
          <div>
            <Label className='text-base font-medium mb-3 block'>Sounds in Error</Label>
            <div className='grid grid-cols-3 md:grid-cols-6 gap-3'>
              {articulationSounds.map(sound => (
                <div key={sound} className='flex flex-col'>
                  <button
                    type='button'
                    onClick={() => handleSoundToggle(sound)}
                    className={`p-2 text-center border rounded-md transition-colors ${
                      selectedSounds.includes(sound)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                    }`}>
                    {sound}
                  </button>
                  {selectedSounds.includes(sound) && (
                    <>
                      {/* Error Patterns for this sound */}
                      <div className='mt-2 space-y-1'>
                        {soundErrorPatterns[sound]?.patterns.map(pattern => {
                          const currentPatterns = selectedErrorPatterns[sound] || []

                          // Global rule: "Other" disables all other patterns when selected, and other patterns disable "Other"
                          const isOtherSelected = currentPatterns.includes('Other')
                          const isOtherPattern = pattern === 'Other'
                          const hasOtherPatterns = currentPatterns.some(p => p !== 'Other')
                          const isOtherDisabled = isOtherSelected && !isOtherPattern
                          const isOtherCheckboxDisabled = hasOtherPatterns && isOtherPattern

                          // For 2 syllables and 3 syllables, implement mutual exclusion
                          const isSyllableSound = sound === '2 syllables' || sound === '3 syllables'
                          const isSyllableDisabled =
                            isSyllableSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern)

                          // For P, B, and Final P sounds: Omission disables others, Nasalization can be combined
                          const isPBFinalPSound =
                            sound === 'P' || sound === 'B' || sound === 'Final P'
                          const isOmissionSelected = currentPatterns.includes('Omission')
                          const isPBDisabled =
                            isPBFinalPSound &&
                            ((pattern === 'Omission' &&
                              currentPatterns.length > 0 &&
                              !currentPatterns.includes('Omission')) ||
                              (pattern !== 'Omission' && isOmissionSelected))

                          // For M sound: Omission is exclusive
                          const isMSound = sound === 'M'
                          const isMDisabled =
                            isMSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern)

                          // For Final T and Final K: Omission disables others, Backing/Nasalization can be combined
                          const isFinalTKSound = sound === 'Final T' || sound === 'Final K'
                          const isFinalTKOmissionSelected = currentPatterns.includes('Omission')
                          const isFinalTKDisabled =
                            isFinalTKSound &&
                            ((pattern === 'Omission' &&
                              currentPatterns.length > 0 &&
                              !currentPatterns.includes('Omission')) ||
                              (pattern !== 'Omission' && isFinalTKOmissionSelected))

                          // For St-: Disable invalid combinations
                          const isStSound = sound === 'St-'
                          const isStDisabled =
                            isStSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern) &&
                            !isValidStCombination([...currentPatterns, pattern])

                          // For Sp-: Disable invalid combinations
                          const isSpSound = sound === 'Sp-'
                          const isSpDisabled =
                            isSpSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern) &&
                            !isValidSpCombination([...currentPatterns, pattern])

                          // For Sn-: Disable invalid combinations
                          const isSnSound = sound === 'Sn-'
                          const isSnDisabled =
                            isSnSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern) &&
                            !isValidSnCombination([...currentPatterns, pattern])

                          // For Sm-: Disable invalid combinations
                          const isSmSound = sound === 'Sm-'
                          const isSmDisabled =
                            isSmSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern) &&
                            !isValidSmCombination([...currentPatterns, pattern])

                          // For Sk-: Disable invalid combinations
                          const isSkSound = sound === 'Sk-'
                          const isSkDisabled =
                            isSkSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern) &&
                            !isValidSkCombination([...currentPatterns, pattern])

                          // For Final -ts: Disable invalid combinations
                          const isFinalTsSound = sound === 'Final -ts'
                          const isFinalTsDisabled =
                            isFinalTsSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern) &&
                            !isValidFinalTsCombination([...currentPatterns, pattern])

                          // For Final -ps: Disable invalid combinations
                          const isFinalPsSound = sound === 'Final -ps'
                          const isFinalPsDisabled =
                            isFinalPsSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern) &&
                            !isValidFinalPsCombination([...currentPatterns, pattern])

                          // For Final -ks: Disable invalid combinations
                          const isFinalKsSound = sound === 'Final -ks'
                          const isFinalKsDisabled =
                            isFinalKsSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern) &&
                            !isValidFinalKsCombination([...currentPatterns, pattern])

                          // For K and G: Disable invalid combinations
                          const isKGSound = sound === 'K' || sound === 'G'
                          const isKGDisabled =
                            isKGSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern) &&
                            !isValidKGCombination([...currentPatterns, pattern])

                          // For T and D: Disable invalid combinations
                          const isTDSound = sound === 'T' || sound === 'D'
                          const isTDDisabled =
                            isTDSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern) &&
                            !isValidTDCombination([...currentPatterns, pattern])

                          // For L and R: Disable other patterns when one is selected
                          const isLRSound = sound === 'L' || sound === 'R'
                          const isLRDisabled =
                            isLRSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern)

                          // For S, Z, Ch, Sh, J, F, V, th: Disable only 'Other' exclusivity
                          const isSZSound =
                            sound === 'S' ||
                            sound === 'Z' ||
                            sound === 'Ch' ||
                            sound === 'Sh' ||
                            sound === 'J' ||
                            sound === 'F' ||
                            sound === 'V' ||
                            sound === 'th'
                          const isSZDisabled =
                            isSZSound &&
                            pattern === 'Other' &&
                            currentPatterns.some(p => p !== 'Other') // Disable 'Other' if other patterns are selected

                          const isDisabled =
                            isOtherDisabled ||
                            isOtherCheckboxDisabled ||
                            isSyllableDisabled ||
                            isPBDisabled ||
                            isMDisabled ||
                            isFinalTKDisabled ||
                            isStDisabled ||
                            isSpDisabled ||
                            isSnDisabled ||
                            isSmDisabled ||
                            isSkDisabled ||
                            isFinalTsDisabled ||
                            isFinalPsDisabled ||
                            isFinalKsDisabled ||
                            isKGDisabled ||
                            isTDDisabled ||
                            isLRDisabled ||
                            isSZDisabled

                          return (
                            <div key={pattern} className='space-y-2'>
                              {/* Notes input - show above "Other" pattern when any non-Other pattern is selected */}
                              {pattern === 'Other' &&
                                (selectedErrorPatterns[sound] || []).some(p => p !== 'Other') && (
                                  <div className='mb-2'>
                                    <Label className='text-xs font-medium text-gray-700 block mb-1'>
                                      Notes:
                                    </Label>
                                    <input
                                      type='text'
                                      placeholder='Notes for this sound...'
                                      value={notes[sound] || ''}
                                      onChange={e => handleNoteChange(sound, e.target.value)}
                                      className='text-xs px-3 py-2 border border-gray-300 rounded-sm w-full'
                                    />
                                  </div>
                                )}

                              <div className='flex items-center space-x-2'>
                                <Checkbox
                                  id={`${sound}-${pattern}`}
                                  checked={currentPatterns.includes(pattern)}
                                  onCheckedChange={checked =>
                                    handleErrorPatternChange(sound, pattern, checked as boolean)
                                  }
                                  disabled={isDisabled}
                                />
                                <Label
                                  htmlFor={`${sound}-${pattern}`}
                                  className={`text-xs font-medium ${
                                    isDisabled ? 'text-gray-400' : ''
                                  }`}>
                                  {pattern}
                                </Label>
                              </div>

                              {/* Stopping Sound Options - show when Stopping is selected */}
                              {pattern === 'Stopping' && currentPatterns.includes('Stopping') && (
                                <div className='ml-6 space-y-1'>
                                  <div className='text-xs font-medium text-gray-700'>
                                    Stopping to:
                                  </div>
                                  <div className='grid grid-cols-3 gap-2'>
                                    {stoppingSoundOptions.map(stoppingSound => {
                                      const currentStoppingSounds =
                                        selectedStoppingSounds[sound] || []
                                      const isSelected =
                                        currentStoppingSounds.includes(stoppingSound)
                                      const isDisabled =
                                        currentStoppingSounds.length > 0 && !isSelected

                                      return (
                                        <div
                                          key={stoppingSound}
                                          className='flex items-center space-x-2'>
                                          <Checkbox
                                            id={`${sound}-stopping-${stoppingSound}`}
                                            checked={isSelected}
                                            onCheckedChange={checked =>
                                              handleStoppingSoundChange(
                                                sound,
                                                stoppingSound,
                                                checked as boolean
                                              )
                                            }
                                            disabled={isDisabled}
                                          />
                                          <Label
                                            htmlFor={`${sound}-stopping-${stoppingSound}`}
                                            className={`text-xs font-medium ${
                                              isDisabled ? 'text-gray-400' : ''
                                            }`}>
                                            {stoppingSound}
                                          </Label>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Word example */}
                      <div className='mt-1 text-xs text-gray-600'>
                        Word: {soundErrorPatterns[sound]?.word}
                      </div>

                      {/* Notes for 2 syllables and 3 syllables - show when any pattern is selected */}
                      {(sound === '2 syllables' || sound === '3 syllables') &&
                        (selectedErrorPatterns[sound] || []).length > 0 && (
                          <div className='mt-2'>
                            <Label className='text-xs font-medium text-gray-700 block mb-1'>
                              Notes:
                            </Label>
                            <input
                              type='text'
                              placeholder='Notes for this sound...'
                              value={notes[sound] || ''}
                              onChange={e => handleNoteChange(sound, e.target.value)}
                              className='text-xs px-3 py-2 border border-gray-300 rounded-sm w-full'
                            />
                          </div>
                        )}

                      {/* Other Notes for this sound - show ONLY when "Other" is checked */}
                      {(selectedErrorPatterns[sound] || []).includes('Other') && (
                        <Textarea
                          placeholder='Specify other error pattern...'
                          value={soundNotes[sound] || ''}
                          onChange={e => handleSoundNoteChange(sound, e.target.value)}
                          className='mt-2 text-xs'
                          rows={2}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* General Articulation Notes */}
          <div>
            <Label htmlFor='general_articulation_notes'>General Articulation Notes (Private)</Label>
            <Textarea
              {...form.register('general_articulation_notes')}
              placeholder='Add general articulation notes...'
              rows={3}
              className='mt-1'
            />
          </div>
        </CardContent>
      </Card>

      {/* Speech Screen Result */}
      <Card>
        <CardHeader>
          <CardTitle>Speech Screen Result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='speech_screen_result'>Result *</Label>
              <Select
                value={form.watch('speech_screen_result') || ''}
                onValueChange={value => {
                  form.setValue('speech_screen_result', value)
                  form.trigger('speech_screen_result')
                }}>
                <SelectTrigger>
                  <SelectValue placeholder='Select result' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='age_appropriate'>Age Appropriate</SelectItem>
                  <SelectItem value='monitor'>Monitor (Age Appropriate)</SelectItem>
                  <SelectItem value='mild'>Mild</SelectItem>
                  <SelectItem value='moderate'>Moderate</SelectItem>
                  <SelectItem value='severe'>Severe</SelectItem>
                  <SelectItem value='profound'>Profound</SelectItem>
                  <SelectItem value='complex_needs'>Complex needs</SelectItem>
                  <SelectItem value='unable_to_screen'>Unable to screen (Compliance)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='vocabulary_support_recommended'
                checked={form.watch('vocabulary_support_recommended') || false}
                onCheckedChange={checked => {
                  form.setValue('vocabulary_support_recommended', checked as boolean)
                }}
              />
              <Label htmlFor='vocabulary_support_recommended' className='text-sm font-medium'>
                Vocabulary Support Recommended (Language Ladder)
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='qualifies_for_speech_program'
                checked={form.watch('qualifies_for_speech_program') || false}
                onCheckedChange={checked => {
                  form.setValue('qualifies_for_speech_program', checked as boolean)
                }}
              />
              <Label htmlFor='qualifies_for_speech_program' className='text-sm font-medium'>
                Qualifies for Speech Program
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Areas of Concern */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Areas of Concern (Private)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {areasOfConcern.map(concern => (
              <div key={concern} className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id={concern}
                    checked={selectedConcerns.includes(concern)}
                    onCheckedChange={checked => handleConcernChange(concern, checked as boolean)}
                  />
                  <Label htmlFor={concern} className='text-sm font-medium'>
                    {concern}
                  </Label>
                </div>

                {selectedConcerns.includes(concern) && (
                  <div className='ml-6'>
                    <Textarea
                      value={form.watch('areasOfConcern')?.[getFieldName(concern)] || ''}
                      onChange={e => {
                        const current = form.watch('areasOfConcern') || {}
                        form.setValue('areasOfConcern', {
                          ...current,
                          [getFieldName(concern)]: e.target.value,
                        })
                      }}
                      placeholder='Details...'
                      rows={3}
                      className='w-full'
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedSpeechScreeningFields
