import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useSpeechScreeningState } from './useSpeechScreeningState'
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
  stimulabilityOptions,
} from './EnhancedSpeechScreeningFieldData'
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

interface EnhancedSpeechScreeningFieldsProps {
  form: UseFormReturn<SpeechScreeningFormValues>
}

const EnhancedSpeechScreeningFields = ({ form }: EnhancedSpeechScreeningFieldsProps) => {
  const {
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
  } = useSpeechScreeningState(form)

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
              {articulationSounds.map(sound => {
                return (
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

                            const isExclusive = (p: string) =>
                              p === 'Other' || p === 'Stimulability'

                            const hasExclusiveSelected = currentPatterns.some(isExclusive)
                            const isThisPatternExclusive = isExclusive(pattern)
                            const hasNonExclusiveSelected = currentPatterns.some(
                              p => !isExclusive(p)
                            )

                            // If an exclusive pattern is selected, disable all non-exclusive patterns
                            const isOtherDisabled =
                              hasExclusiveSelected && !currentPatterns.includes(pattern)

                            // If any non-exclusive pattern is selected, disable all exclusive patterns
                            const isOtherCheckboxDisabled =
                              hasNonExclusiveSelected && isThisPatternExclusive

                            // For 2 syllables and 3 syllables, implement mutual exclusion
                            const isSyllableSound =
                              sound === '2 syllables' || sound === '3 syllables'
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

                                {/* Stimulability Options - show when Stimulability is selected */}
                                {pattern === 'Stimulability' &&
                                  currentPatterns.includes('Stimulability') && (
                                    <div className='ml-6 space-y-1'>
                                      <div className='text-xs font-medium text-gray-700'>
                                        Stimulable at:
                                      </div>
                                      <div className='grid grid-cols-2 gap-2'>
                                        {stimulabilityOptions.map(option => {
                                          const currentOptions =
                                            selectedStimulabilityOptions[sound] || []
                                          const isSelected = currentOptions.includes(option)
                                          const isDisabled =
                                            currentOptions.length > 0 && !isSelected

                                          return (
                                            <div
                                              key={option}
                                              className='flex items-center space-x-2'>
                                              <Checkbox
                                                id={`${sound}-stimulability-${option}`}
                                                checked={isSelected}
                                                onCheckedChange={checked =>
                                                  handleStimulabilityOptionChange(
                                                    sound,
                                                    option,
                                                    checked as boolean
                                                  )
                                                }
                                                disabled={isDisabled}
                                              />
                                              <Label
                                                htmlFor={`${sound}-stimulability-${option}`}
                                                className={`text-xs font-medium ${isDisabled ? 'text-gray-400' : ''}`}>
                                                {option}
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
                                        className={`px-2 py-1 border border-gray-300 rounded-sm text-xs w-20`}
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
                                className={`text-xs px-3 py-2 border border-gray-300 rounded-sm w-full`}
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
                )
              })}
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
        <CardHeader
          className='cursor-pointer select-none'
          onClick={() => setAreasOfConcernOpen(prev => !prev)}>
          <CardTitle className='flex items-center justify-between'>
            Additional Areas of Concern (Private)
            <span className='text-lg font-normal text-muted-foreground'>
              {areasOfConcernOpen ? '▲ Hide' : '▼ Show'}
            </span>
          </CardTitle>
        </CardHeader>
        {areasOfConcernOpen && (
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
                          const current = form.watch('error_patterns.add_areas_of_concern') || {
                            voice: null,
                            fluency: null,
                            literacy: null,
                            suspected_cas: null,
                            cleft_lip_palate: null,
                            reluctant_speaking: null,
                            language_expression: null,
                            language_comprehension: null,
                            known_pending_diagnoses: null,
                            pragmatics_social_communication: null,
                          }

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
        )}
      </Card>
    </div>
  )
}

export default EnhancedSpeechScreeningFields
