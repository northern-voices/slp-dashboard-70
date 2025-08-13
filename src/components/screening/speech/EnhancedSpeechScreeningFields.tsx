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
} from './EnhancedSpeechScreeningFieldData'

interface EnhancedSpeechScreeningFieldsProps {
  form: UseFormReturn<{
    articulation?: {
      soundErrors: Array<{
        sound: string
        errorPatterns: string[]
        notes: string
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
  const [selectedErrorPatterns, setSelectedErrorPatterns] = useState<Record<string, string[]>>({})

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
      notes: soundNotes[sound] || '',
    }))

    const articulationData = {
      soundErrors: soundErrorsData,
      articulationNotes: form.watch('general_articulation_notes') || '',
    }

    form.setValue('articulation', articulationData)
  }, [selectedSounds, selectedErrorPatterns, soundNotes, form])

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

  const handleErrorPatternChange = (sound: string, pattern: string, checked: boolean) => {
    const currentPatterns = selectedErrorPatterns[sound] || []

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
    } else {
      // For other sounds, use the original logic
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
                          // For 2 syllables and 3 syllables, implement mutual exclusion
                          const isSyllableSound = sound === '2 syllables' || sound === '3 syllables'
                          const currentPatterns = selectedErrorPatterns[sound] || []
                          const isDisabled =
                            isSyllableSound &&
                            currentPatterns.length > 0 &&
                            !currentPatterns.includes(pattern)

                          return (
                            <div key={pattern} className='flex items-center space-x-2'>
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
                          )
                        })}
                      </div>
                      {/* Word example */}
                      <div className='mt-1 text-xs text-gray-600'>
                        Word: {soundErrorPatterns[sound]?.word}
                      </div>

                      {/* Notes for this sound - show when "Other" is checked OR when syllable patterns are selected */}
                      {((selectedErrorPatterns[sound] || []).includes('Other') ||
                        ((sound === '2 syllables' || sound === '3 syllables') &&
                          (selectedErrorPatterns[sound] || []).length > 0)) && (
                        <Textarea
                          placeholder={
                            sound === '2 syllables' || sound === '3 syllables'
                              ? 'Notes...'
                              : 'Specify other error pattern...'
                          }
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
