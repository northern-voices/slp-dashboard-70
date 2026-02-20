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
    screening_type: string
    screening_date: string
    clinical_notes: string
    referral_notes: string
    result: string
    vocabulary_support: boolean
    speech_screen_result: string
    vocabulary_support_recommended: boolean
    qualifies_for_speech_program: boolean
    sub: boolean
    graduated: boolean
    error_patterns: {
      attendance: {
        absent: boolean
        absence_notes: string
        priority_re_screen: boolean
      }
      articulation: {
        soundErrors: Array<{
          sound: string
          word: string
          errorPatterns: string[]
          stoppingSounds?: string[]
          notes: string
          otherNotes?: string
        }>
        articulationNotes: string
      }
      screening_metadata: {
        screening_date: string
        qualifies_for_speech_program: boolean
        vocabulary_support_recommended: boolean
        sub?: boolean
        graduated?: boolean
      }
      add_areas_of_concern: Record<string, string | null>
      additional_observations: string
    }
    general_articulation_notes?: string
  }>
}

const EnhancedSpeechScreeningFields = ({ form }: EnhancedSpeechScreeningFieldsProps) => {
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [selectedSounds, setSelectedSounds] = useState<string[]>([])
  const [soundNotes, setSoundNotes] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [notesEnabled, setNotesEnabled] = useState<Record<string, boolean>>({})
  const [selectedErrorPatterns, setSelectedErrorPatterns] = useState<Record<string, string[]>>({})
  const [selectedStoppingSounds, setSelectedStoppingSounds] = useState<Record<string, string[]>>({})
  const [initialized, setInitialized] = useState(false)

  // Initialize component state from form data when available (for editing existing screenings)
  React.useEffect(() => {
    const formData = form.getValues()
    const errorPatterns = formData?.error_patterns

    if (errorPatterns && !initialized) {
      // Initialize articulation data
      if (errorPatterns.articulation?.soundErrors?.length > 0) {
        const sounds = errorPatterns.articulation.soundErrors.map(se => se.sound)
        const patterns: Record<string, string[]> = {}
        const stoppingSounds: Record<string, string[]> = {}
        const soundNotesData: Record<string, string> = {}
        const notesData: Record<string, string> = {}
        const notesEnabledData: Record<string, boolean> = {}

        errorPatterns.articulation.soundErrors.forEach(soundError => {
          if (soundError.errorPatterns) {
            patterns[soundError.sound] = soundError.errorPatterns
          }
          if (soundError.stoppingSounds) {
            stoppingSounds[soundError.sound] = soundError.stoppingSounds
          }
          if (soundError.notes) {
            soundNotesData[soundError.sound] = soundError.notes
            notesEnabledData[soundError.sound] = true
          }
          if (soundError.otherNotes) {
            notesData[soundError.sound] = soundError.otherNotes
          }
        })

        setSelectedSounds(sounds)
        setSelectedErrorPatterns(patterns)
        setSelectedStoppingSounds(stoppingSounds)
        setSoundNotes(soundNotesData)
        setNotes(notesData)
        setNotesEnabled(notesEnabledData)
      }

      // Initialize areas of concern
      if (errorPatterns.add_areas_of_concern) {
        const concerns: string[] = []
        Object.entries(errorPatterns.add_areas_of_concern).forEach(([key, value]) => {
          if (value !== null && value !== '') {
            // Convert key back to concern label
            const concern = areasOfConcern.find(c => {
              const transformed = c
                .toLowerCase()
                .replace(/\s+|\/|-/g, '_')
                .replace(/_+/g, '_')
                .replace(/_$/, '')
                .replace(/_pallet/, '_pallet')
              return transformed === key
            })
            if (concern) {
              concerns.push(concern)
            }
          }
        })
        setSelectedConcerns(concerns)
      }

      setInitialized(true)
    }
  }, [form, initialized])

  // Helper function to validate St- combinations
  const isValidStCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // Omits ST is mutually exclusive - cannot be combined with any other patterns
    const hasOmitsST = patterns.includes('Omits ST')
    if (hasOmitsST && patterns.length > 1) {
      return false
    }

    // Valid combinations for St- (excluding Omits ST):
    // 1. Omits S & Backing
    // 2. Frontal Lisp & Backing
    // 3. Lateral Lisp & Backing
    // 4. Omits S & Nasalization
    // 5. Omits T & Frontal Lisp
    // 6. Omits T & Lateral Lisp
    // 7. Omits T & Nasalization

    const hasClusterReductionS = patterns.includes('Omits S')
    const hasClusterReductionT = patterns.includes('Omits T')
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

    // Omits SP is mutually exclusive - cannot be combined with any other patterns
    const hasOmitsSP = patterns.includes('Omits SP')
    if (hasOmitsSP && patterns.length > 1) {
      return false
    }

    // Valid combinations for Sp- (excluding Omits SP):
    // 1. Omits S & Nasalization
    // 2. Omits P & Frontal Lisp
    // 3. Omits P & Lateral Lisp
    // 4. Omits P & Nasalization

    const hasClusterReductionS = patterns.includes('Omits S')
    const hasClusterReductionP = patterns.includes('Omits P')
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

    // Omits SN is mutually exclusive - cannot be combined with any other patterns
    const hasOmitsSN = patterns.includes('Omits SN')
    if (hasOmitsSN && patterns.length > 1) {
      return false
    }

    // Valid combinations for Sn- (excluding Omits SN):
    // 1. Omits S & Nasalization
    // 2. Omits N & Nasalization
    // 3. Omits N & Frontal Lisp
    // 4. Omits N & Lateral Lisp

    const hasClusterReductionS = patterns.includes('Omits S')
    const hasClusterReductionN = patterns.includes('Omits N')
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

    // Omits SM is mutually exclusive - cannot be combined with any other patterns
    const hasOmitsSM = patterns.includes('Omits SM')
    if (hasOmitsSM && patterns.length > 1) {
      return false
    }

    // Valid combinations for Sm- (excluding Omits SM):
    // 1. Omits S & Nasalization
    // 2. Omits M & Nasalization
    // 3. Omits M & Frontal Lisp
    // 4. Omits M & Lateral Lisp

    const hasClusterReductionS = patterns.includes('Omits S')
    const hasClusterReductionM = patterns.includes('Omits M')
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

    // Omits SK is mutually exclusive - cannot be combined with any other patterns
    const hasOmitsSK = patterns.includes('Omits SK')
    if (hasOmitsSK && patterns.length > 1) {
      return false
    }

    // Valid combinations for Sk- (excluding Omits SK):
    // 1. Frontal Lisp & Fronting
    // 2. Lateral Lisp & Fronting
    // 3. Omits S & Fronting
    // 4. Omits K & Frontal Lisp
    // 5. Omits K & Lateral Lisp

    const hasClusterReductionS = patterns.includes('Omits S')
    const hasClusterReductionK = patterns.includes('Omits K')
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

    // Omits TS is mutually exclusive - cannot be combined with any other patterns
    const hasOmitsTS = patterns.includes('Omits TS')
    if (hasOmitsTS && patterns.length > 1) {
      return false
    }

    // Valid combinations for Final -ts (excluding Omits TS):
    // 1. Omits S & Backing
    // 2. Omits T & Frontal Lisp
    // 3. Omits T & Lateral Lisp

    const hasClusterReductionS = patterns.includes('Omits S')
    const hasClusterReductionT = patterns.includes('Omits T')
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

    // Omits PS is mutually exclusive - cannot be combined with any other patterns
    const hasOmitsPS = patterns.includes('Omits PS')
    if (hasOmitsPS && patterns.length > 1) {
      return false
    }

    // Valid combinations for Final -ps (excluding Omits PS):
    // 1. Omits P & Frontal Lisp
    // 2. Omits P & Lateral Lisp

    const hasClusterReductionP = patterns.includes('Omits P')
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

    // Omits KS is mutually exclusive - cannot be combined with any other patterns
    const hasOmitsKS = patterns.includes('Omits KS')
    if (hasOmitsKS && patterns.length > 1) {
      return false
    }

    // Valid combinations for Final -ks (excluding Omits KS):
    // 1. Omits K & Frontal Lisp
    // 2. Omits K & Lateral Lisp
    // 3. Omits S & Fronting

    const hasClusterReductionK = patterns.includes('Omits K')
    const hasClusterReductionS = patterns.includes('Omits S')
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

  // Helper function to validate -ar combinations
  const isValidArCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // For -ar: "Vowelization w" and "Vowelization y" are mutually exclusive
    const hasVowelizationW = patterns.includes('Vowelization w')
    const hasVowelizationY = patterns.includes('Vowelization y')

    // Check if both vowelization patterns are selected (not allowed)
    if (hasVowelizationW && hasVowelizationY) {
      return false
    }

    return true
  }

  // Helper function to validate -or combinations
  const isValidOrCombination = (patterns: string[]): boolean => {
    if (patterns.length === 0) return true
    if (patterns.length === 1) return true

    // For -or: "Vowelization oh/w" and "Vowelization y" are mutually exclusive
    const hasVowelizationOhW = patterns.includes('Vowelization oh/w')
    const hasVowelizationY = patterns.includes('Vowelization y')

    // Check if both vowelization patterns are selected (not allowed)
    if (hasVowelizationOhW && hasVowelizationY) {
      return false
    }

    return true
  }

  // Helper function to convert concern names to field names
  const getFieldName = (concern: string): string => {
    // Use the same transformation logic used elsewhere in the component
    return concern
      .toLowerCase()
      .replace(/\s+|\/|-/g, '_')
      .replace(/_+/g, '_')
      .replace(/_$/, '')
      .replace(/_pallet/, '_pallet')
  }

  // Create nested structure for articulation data
  React.useEffect(() => {
    const soundErrorsData = selectedSounds.map(sound => {
      const word = soundErrorPatterns[sound]?.word || ''
      const hasOtherPattern = selectedErrorPatterns[sound]?.includes('Other')

      let otherNotes = ''
      if (hasOtherPattern && soundNotes[sound]) {
        // Format: "Hear for Bear" when "Other" is selected
        otherNotes = `${soundNotes[sound]} for ${word}`
      }

      return {
        sound: sound,
        word: word,
        errorPatterns: selectedErrorPatterns[sound] || [],
        stoppingSounds: selectedStoppingSounds[sound] || [],
        notes: notes[sound] || '',
        otherNotes: otherNotes,
      }
    })

    const articulationData = {
      soundErrors: soundErrorsData,
      articulationNotes: form.watch('general_articulation_notes') || '',
    }

    form.setValue('error_patterns.articulation', articulationData)
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
    // Get current form data to preserve existing values
    const currentData = form.getValues('error_patterns.add_areas_of_concern') || {}
    const areasOfConcernData = {}

    // Initialize all fields
    areasOfConcern.forEach(concern => {
      const key = concern
        .toLowerCase()
        .replace(/\s+|\/|-/g, '_')
        .replace(/_+/g, '_')
        .replace(/_$/, '')
        .replace(/_pallet/, '_pallet')

      // For editing: preserve existing values during initialization
      // For new screening: start with null
      if (initialized) {
        // After initialization, preserve existing values
        areasOfConcernData[key] = currentData[key] || null
      } else {
        // During initialization, only preserve non-null values (from loaded data)
        areasOfConcernData[key] = currentData[key] !== null ? currentData[key] : null
      }
    })

    // For selected concerns, ensure they're properly handled
    selectedConcerns.forEach(concern => {
      const key = concern
        .toLowerCase()
        .replace(/\s+|\/|-/g, '_')
        .replace(/_+/g, '_')
        .replace(/_$/, '')
        .replace(/_pallet/, '_pallet')

      if (initialized) {
        // After initialization (user interaction), set empty string for new selections
        if (areasOfConcernData[key] === null) {
          areasOfConcernData[key] = ''
        }
      }
      // During initialization, keep whatever value was loaded (including non-null values)
    })

    form.setValue('error_patterns.add_areas_of_concern', areasOfConcernData)
  }, [selectedConcerns, form, initialized])

  const handleSoundToggle = (sound: string) => {
    if (selectedSounds.includes(sound)) {
      setSelectedSounds(selectedSounds.filter(s => s !== sound))
      const newNotes = { ...soundNotes }
      delete newNotes[sound]
      setSoundNotes(newNotes)
      const newSoundNotes = { ...notes }
      delete newSoundNotes[sound]
      setNotes(newSoundNotes)
      setNotesEnabled({ ...notesEnabled, [sound]: false })

      // Clear stopping sounds for this sound
      const newStoppingSounds = { ...selectedStoppingSounds }
      delete newStoppingSounds[sound]
      setSelectedStoppingSounds(newStoppingSounds)
    } else {
      setSelectedSounds([...selectedSounds, sound])
      // Notes are always available for every sound, but unchecked by default
      setNotesEnabled({ ...notesEnabled, [sound]: false })
    }
  }

  const handleSoundNoteChange = (sound: string, value: string) => {
    setSoundNotes({
      ...soundNotes,
      [sound]: value,
    })
  }

  const handleNotesToggle = (sound: string, enabled: boolean) => {
    setNotesEnabled({
      ...notesEnabled,
      [sound]: enabled,
    })
    // Clear notes when disabling
    if (!enabled) {
      const newNotes = { ...notes }
      delete newNotes[sound]
      setNotes(newNotes)
    }
  }

  const clearNotesForSound = (sound: string) => {
    const newNotes = { ...notes }
    delete newNotes[sound]
    setNotes(newNotes)
    setNotesEnabled({ ...notesEnabled, [sound]: false })
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

    // Global rule: "Other" and "Stimulability" are always exclusive
    if (pattern === 'Other' || pattern === 'Stimulability') {
      if (checked) {
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: [pattern],
        })
      } else {
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: [],
        })
        clearNotesForSound(sound)
      }
      return
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
        // Clear notes when no patterns remain
        clearNotesForSound(sound)
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
        // Clear notes when no patterns remain
        clearNotesForSound(sound)
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
    } else if (sound === '-ar') {
      // For -ar: "Vowelization w" and "Vowelization y" are mutually exclusive
      if (checked) {
        // Check if this combination is valid
        const newPatterns = [...currentPatterns, pattern]
        if (isValidArCombination(newPatterns)) {
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
    } else if (sound === '-or') {
      // For -or: "Vowelization oh/w" and "Vowelization y" are mutually exclusive
      if (checked) {
        // Check if this combination is valid
        const newPatterns = [...currentPatterns, pattern]
        if (isValidOrCombination(newPatterns)) {
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
                        {soundErrorPatterns[sound]?.patterns.map(patternObj => {
                          const pattern = patternObj.value
                          const patternDisplay = patternObj.display
                          const currentPatterns = selectedErrorPatterns[sound] || []

                          const isExclusive = (p: string) => p === 'Other' || p === 'Stimulability'

                          const hasExclusiveSelected = currentPatterns.some(isExclusive)
                          const isThisPatternExclusive = isExclusive(pattern)
                          const hasNonExclusiveSelected = currentPatterns.some(p => !isExclusive(p))

                          // If an exclusive pattern is selected, disable all non-exclusive patterns
                          const isOtherDisabled =
                            hasExclusiveSelected && !currentPatterns.includes(pattern)

                          // If any non-exclusive pattern is selected, disable all exclusive patterns
                          const isOtherCheckboxDisabled =
                            hasNonExclusiveSelected && isThisPatternExclusive

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

                          // For -ar: Disable invalid combinations
                          const isArSound = sound === '-ar'
                          const isArDisabled =
                            isArSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern) &&
                            !isValidArCombination([...currentPatterns, pattern])

                          // For -or: Disable invalid combinations
                          const isOrSound = sound === '-or'
                          const isOrDisabled =
                            isOrSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern) &&
                            !isValidOrCombination([...currentPatterns, pattern])

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
                            isSZDisabled ||
                            isArDisabled ||
                            isOrDisabled

                          return (
                            <div key={pattern} className='space-y-2'>
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
                                  {patternDisplay}
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
                                                checked as boolean,
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

                              {/* Other Error Pattern input - show when "Other" is selected */}
                              {pattern === 'Other' && currentPatterns.includes('Other') && (
                                <div className='mt-2'>
                                  <Label className='text-xs font-medium text-gray-700 block mb-1'>
                                    Other Error Pattern:
                                  </Label>
                                  <div className='flex items-center gap-2 text-xs'>
                                    <span className='text-gray-600'>"</span>
                                    <input
                                      type='text'
                                      value={soundNotes[sound] || ''}
                                      onChange={e => handleSoundNoteChange(sound, e.target.value)}
                                      className='px-2 py-1 border border-gray-300 rounded-sm text-xs w-20'
                                    />
                                    <span className='text-gray-600'>
                                      " for {soundErrorPatterns[sound]?.word || sound}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Notes checkbox - always visible for every sound */}
                      <div className='mt-1 space-y-2'>
                        <div className='flex items-center space-x-2'>
                          <Checkbox
                            id={`${sound}-notes`}
                            checked={notesEnabled[sound] || false}
                            onCheckedChange={checked =>
                              handleNotesToggle(sound, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={`${sound}-notes`}
                            className='text-xs font-medium text-gray-700'>
                            Notes (Private)
                          </Label>
                        </div>
                        {notesEnabled[sound] && (
                          <div>
                            <input
                              type='text'
                              placeholder='Notes for this sound...'
                              value={notes[sound] || ''}
                              onChange={e => handleNoteChange(sound, e.target.value)}
                              className='text-xs px-3 py-2 border border-gray-300 rounded-sm w-full'
                            />
                          </div>
                        )}
                      </div>

                      {/* Word example - now appears last, below Notes */}
                      <div className='mt-1 text-xs text-gray-600'>
                        Word: {soundErrorPatterns[sound]?.word}
                        {selectedErrorPatterns[sound]?.includes('Other') && soundNotes[sound] && (
                          <span className='ml-2 text-blue-600 font-medium'>
                            → "{soundNotes[sound]} for {soundErrorPatterns[sound]?.word}"
                          </span>
                        )}
                      </div>
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
            <div className='flex flex-col gap-1'>
              <Label htmlFor='speech_screen_result'>
                Result <span className='text-red-500 text-lg'>*</span>
              </Label>
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
                  <SelectItem value='no_errors'>No Errors</SelectItem>
                  <SelectItem value='age_appropriate'>Age Appropriate</SelectItem>
                  {/* <SelectItem value='monitor'>Monitor (Age Appropriate)</SelectItem> // TODO Lisa said to remove this for now */}
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
                disabled={form.watch('sub')}
                onCheckedChange={checked => {
                  form.setValue('qualifies_for_speech_program', checked as boolean)
                  if (checked) {
                    form.setValue('sub', false)
                  }
                }}
              />
              <Label
                htmlFor='qualifies_for_speech_program'
                className={`text-sm font-medium ${form.watch('sub') ? 'text-gray-400' : ''}`}>
                Qualifies for Speech Program
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='sub'
                checked={form.watch('sub') || false}
                disabled={form.watch('qualifies_for_speech_program') || false}
                onCheckedChange={checked => {
                  form.setValue('sub', checked as boolean)
                  if (checked) {
                    form.setValue('qualifies_for_speech_program', false)
                  }
                }}
              />
              <Label
                htmlFor='sub'
                className={`text-sm font-medium ${
                  form.watch('qualifies_for_speech_program') ? 'text-gray-400' : ''
                }`}>
                Sub
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
                      value={
                        form.watch('error_patterns.add_areas_of_concern')?.[
                          getFieldName(concern)
                        ] || ''
                      }
                      onChange={e => {
                        const current = form.watch('error_patterns.add_areas_of_concern') || {}
                        form.setValue('error_patterns.add_areas_of_concern', {
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
