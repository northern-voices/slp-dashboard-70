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
  form: UseFormReturn<any>
}

const EnhancedSpeechScreeningFields = ({ form }: EnhancedSpeechScreeningFieldsProps) => {
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [selectedSounds, setSelectedSounds] = useState<string[]>([])
  const [soundNotes, setSoundNotes] = useState<Record<string, string>>({})
  const [selectedErrorPatterns, setSelectedErrorPatterns] = useState<Record<string, string[]>>({})

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
                        {soundErrorPatterns[sound]?.patterns.map(pattern => (
                          <div key={pattern} className='flex items-center space-x-2'>
                            <Checkbox
                              id={`${sound}-${pattern}`}
                              checked={(selectedErrorPatterns[sound] || []).includes(pattern)}
                              onCheckedChange={checked =>
                                handleErrorPatternChange(sound, pattern, checked as boolean)
                              }
                            />
                            <Label htmlFor={`${sound}-${pattern}`} className='text-xs font-medium'>
                              {pattern}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {/* Word example */}
                      <div className='mt-1 text-xs text-gray-600'>
                        Word: {soundErrorPatterns[sound]?.word}
                      </div>

                      {/* Notes for this sound - only show when "Other" is checked */}
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
            <Label htmlFor='general_articulation_notes'>General Articulation Notes</Label>
            <Textarea
              {...form.register('general_articulation_notes')}
              placeholder='Overall patterns, stimulability, consistency...'
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
                id='qualifies_for_speech_program'
                {...form.register('qualifies_for_speech_program')}
              />
              <Label htmlFor='qualifies_for_speech_program' className='text-sm font-medium'>
                Qualifies for Speech Program
              </Label>
            </div>

            <div>
              <Label htmlFor='overall_notes'>Overall Assessment Notes</Label>
              <Textarea
                {...form.register('overall_notes')}
                placeholder='Summary of findings, recommendations, next steps...'
                rows={4}
                className='mt-1'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Areas of Concern */}
      <Card>
        <CardHeader>
          <CardTitle>Areas of Concern</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {areasOfConcern.map(concern => (
              <div key={concern} className='flex items-center space-x-2'>
                <Checkbox
                  id={concern}
                  checked={selectedConcerns.includes(concern)}
                  onCheckedChange={checked => handleConcernChange(concern, checked as boolean)}
                />
                <Label htmlFor={concern} className='text-sm font-medium'>
                  {concern}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Other Areas Assessments */}
      {selectedConcerns.includes('Language Expression') && (
        <Card>
          <CardHeader>
            <CardTitle>Language Expression</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.watch('areasOfConcern')?.language_expression || ''}
              onChange={e => {
                const current = form.watch('areasOfConcern') || {}
                form.setValue('areasOfConcern', {
                  ...current,
                  language_expression: e.target.value,
                })
              }}
              placeholder='Vocabulary, grammar, sentence structure, word finding...'
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {selectedConcerns.includes('Language Comprehension') && (
        <Card>
          <CardHeader>
            <CardTitle>Language Comprehension</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.watch('areasOfConcern')?.language_comprehension || ''}
              onChange={e => {
                const current = form.watch('areasOfConcern') || {}
                form.setValue('areasOfConcern', {
                  ...current,
                  language_comprehension: e.target.value,
                })
              }}
              placeholder='Following directions, understanding questions, comprehension of complex language...'
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {selectedConcerns.includes('Voice') && (
        <Card>
          <CardHeader>
            <CardTitle>Voice</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.watch('areasOfConcern')?.voice || ''}
              onChange={e => {
                const current = form.watch('areasOfConcern') || {}
                form.setValue('areasOfConcern', {
                  ...current,
                  voice: e.target.value,
                })
              }}
              placeholder='Hoarseness, breathiness, loudness, pitch concerns...'
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {selectedConcerns.includes('Fluency') && (
        <Card>
          <CardHeader>
            <CardTitle>Fluency</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.watch('areasOfConcern')?.fluency || ''}
              onChange={e => {
                const current = form.watch('areasOfConcern') || {}
                form.setValue('areasOfConcern', {
                  ...current,
                  fluency: e.target.value,
                })
              }}
              placeholder='Repetitions, prolongations, blocks, secondary behaviors...'
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {selectedConcerns.includes('Stuttering') && (
        <Card>
          <CardHeader>
            <CardTitle>Stuttering</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.watch('areasOfConcern')?.stuttering || ''}
              onChange={e => {
                const current = form.watch('areasOfConcern') || {}
                form.setValue('areasOfConcern', {
                  ...current,
                  stuttering: e.target.value,
                })
              }}
              placeholder='Specific stuttering patterns, severity, impact...'
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {selectedConcerns.includes('Social Communication') && (
        <Card>
          <CardHeader>
            <CardTitle>Social Communication</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.watch('areasOfConcern')?.social_communication || ''}
              onChange={e => {
                const current = form.watch('areasOfConcern') || {}
                form.setValue('areasOfConcern', {
                  ...current,
                  social_communication: e.target.value,
                })
              }}
              placeholder='Eye contact, turn-taking, pragmatic language use...'
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {selectedConcerns.includes('Suspected CAS') && (
        <Card>
          <CardHeader>
            <CardTitle>Suspected CAS</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.watch('areasOfConcern')?.suspected_cas || ''}
              onChange={e => {
                const current = form.watch('areasOfConcern') || {}
                form.setValue('areasOfConcern', {
                  ...current,
                  suspected_cas: e.target.value,
                })
              }}
              placeholder='Inconsistent errors, groping, difficulty with multisyllabic words...'
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {selectedConcerns.includes('Literacy') && (
        <Card>
          <CardHeader>
            <CardTitle>Literacy</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.watch('areasOfConcern')?.literacy || ''}
              onChange={e => {
                const current = form.watch('areasOfConcern') || {}
                form.setValue('areasOfConcern', {
                  ...current,
                  literacy: e.target.value,
                })
              }}
              placeholder='Reading difficulties, writing concerns, phonological awareness...'
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {selectedConcerns.includes('Reluctant Speaking') && (
        <Card>
          <CardHeader>
            <CardTitle>Reluctant Speaking</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.watch('areasOfConcern')?.reluctant_speaking || ''}
              onChange={e => {
                const current = form.watch('areasOfConcern') || {}
                form.setValue('areasOfConcern', {
                  ...current,
                  reluctant_speaking: e.target.value,
                })
              }}
              placeholder='Selective mutism, anxiety, refusal to speak in certain situations...'
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {selectedConcerns.includes('Cleft Lip / Pallet') && (
        <Card>
          <CardHeader>
            <CardTitle>Cleft Lip / Palate</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.watch('areasOfConcern')?.cleft_lip_pallet || ''}
              onChange={e => {
                const current = form.watch('areasOfConcern') || {}
                form.setValue('areasOfConcern', {
                  ...current,
                  cleft_lip_pallet: e.target.value,
                })
              }}
              placeholder='Speech characteristics, resonance issues, articulation patterns...'
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {selectedConcerns.includes('Diagnoses') && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnoses</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.watch('areasOfConcern')?.diagnoses || ''}
              onChange={e => {
                const current = form.watch('areasOfConcern') || {}
                form.setValue('areasOfConcern', {
                  ...current,
                  diagnoses: e.target.value,
                })
              }}
              placeholder='Medical diagnoses, developmental conditions, impact on communication...'
              rows={3}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EnhancedSpeechScreeningFields
