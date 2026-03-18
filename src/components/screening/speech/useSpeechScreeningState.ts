import { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { areasOfConcern, soundErrorPatterns } from './EnhancedSpeechScreeningFieldData'
import { SpeechScreeningFormValues, ErrorPatterns } from '@/types/screening-form'
import {
  isValidStCombination,
  isValidSpCombination,
  isValidSnCombination,
  isValidSmCombination,
  isValidSkCombination,
  isValidFinalTsCombination,
  isValidFinalPsCombination,
  isValidFinalKsCombination,
  isValidKGCombination,
  isValidTDCombination,
  isValidLRCombination,
  isValidSZCombination,
  isValidArCombination,
  isValidOrCombination,
} from './soundCombinationValidators'

export const useSpeechScreeningState = (form: UseFormReturn<SpeechScreeningFormValues>) => {
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [selectedSounds, setSelectedSounds] = useState<string[]>([])
  const [soundNotes, setSoundNotes] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [notesEnabled, setNotesEnabled] = useState<Record<string, boolean>>({})
  const [selectedErrorPatterns, setSelectedErrorPatterns] = useState<Record<string, string[]>>({})
  const [selectedStoppingSounds, setSelectedStoppingSounds] = useState<Record<string, string[]>>({})
  const [selectedStimulabilityOptions, setSelectedStimulabilityOptions] = useState<
    Record<string, string[]>
  >({})
  const [initialized, setInitialized] = useState(false)
  const [areasOfConcernOpen, setAreasOfConcernOpen] = useState(false)

  // Initialize component state from form data when available (for editing existing screenings)
  useEffect(() => {
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
        const stimulabilityOptionsData: Record<string, string[]> = {}

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

          if (soundError.stimulabilityOptions) {
            stimulabilityOptionsData[soundError.sound] = soundError.stimulabilityOptions
          }
        })

        setSelectedSounds(sounds)
        setSelectedErrorPatterns(patterns)
        setSelectedStoppingSounds(stoppingSounds)
        setSoundNotes(soundNotesData)
        setNotes(notesData)
        setNotesEnabled(notesEnabledData)
        setSelectedStimulabilityOptions(stimulabilityOptionsData)
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

  const handleConcernChange = (concern: string, checked: boolean) => {
    if (checked) {
      setSelectedConcerns([...selectedConcerns, concern])
    } else {
      setSelectedConcerns(selectedConcerns.filter(c => c !== concern))
    }
  }

  // Create areas of concern object structure
  useEffect(() => {
    // Get current form data to preserve existing values
    const currentData = form.getValues('error_patterns.add_areas_of_concern') || {}
    const areasOfConcernData: Record<string, string | boolean | null> = {}

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

    form.setValue(
      'error_patterns.add_areas_of_concern',
      areasOfConcernData as ErrorPatterns['add_areas_of_concern']
    )
  }, [selectedConcerns, form, initialized])

  // Create nested structure for articulation data
  useEffect(() => {
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
        stimulabilityOptions: selectedStimulabilityOptions[sound] || [],
        notes: notes[sound] || '',
        otherNotes: otherNotes,
      }
    })

    const articulationData = {
      soundErrors: soundErrorsData,
      articulationNotes: form.watch('general_articulation_notes') || '',
    }

    form.setValue('error_patterns.articulation', articulationData)
  }, [
    selectedSounds,
    selectedErrorPatterns,
    selectedStoppingSounds,
    selectedStimulabilityOptions,
    soundNotes,
    notes,
    form,
  ])

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

      const newStimulabilityOptions = { ...selectedStimulabilityOptions }
      delete newStimulabilityOptions[sound]
      setSelectedStimulabilityOptions(newStimulabilityOptions)
    } else {
      setSelectedSounds([...selectedSounds, sound])
      // Notes are always available for every sound, but unchecked by default
      setNotesEnabled({ ...notesEnabled, [sound]: false })
    }
  }

  const handleStimulabilityOptionChange = (sound: string, option: string, checked: boolean) => {
    if (checked) {
      // Only allow one at a time
      setSelectedStimulabilityOptions({
        ...selectedStimulabilityOptions,
        [sound]: [option],
      })
    } else {
      setSelectedStimulabilityOptions({
        ...selectedStimulabilityOptions,
        [sound]: [],
      })
    }
  }

  const handleSoundNoteChange = (sound: string, value: string) => {
    setSoundNotes({
      ...soundNotes,
      [sound]: value,
    })
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
        if (pattern === 'Stimulability') {
          setSelectedStimulabilityOptions({
            ...selectedStimulabilityOptions,
            [sound]: ['Word'],
          })
        }
      } else {
        setSelectedErrorPatterns({
          ...selectedErrorPatterns,
          [sound]: [],
        })
        clearNotesForSound(sound)
        if (pattern === 'Stimulability') {
          setSelectedStimulabilityOptions({
            ...selectedStimulabilityOptions,
            [sound]: [],
          })
        }
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

  return {
    selectedSounds,
    soundNotes,
    notes,
    notesEnabled,
    selectedErrorPatterns,
    selectedStoppingSounds,
    selectedStimulabilityOptions,
    handleSoundToggle,
    handleSoundNoteChange,
    handleNotesToggle,
    handleNoteChange,
    handleStoppingSoundChange,
    handleStimulabilityOptionChange,
    handleErrorPatternChange,
    selectedConcerns,
    areasOfConcernOpen,
    setAreasOfConcernOpen,
    handleConcernChange,
    getFieldName,
  }
}
