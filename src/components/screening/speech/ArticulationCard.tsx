import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  articulationSounds,
  soundErrorPatterns,
  stoppingSoundOptions,
  stimulabilityOptions,
} from './EnhancedSpeechScreeningFieldData'
import { SpeechScreeningFormValues } from '@/types/screening-form'
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
  isValidArCombination,
  isValidOrCombination,
} from './soundCombinationValidators'

const computePatternDisabled = (
  sound: string,
  pattern: string,
  currentPatterns: string[]
): boolean => {
  const isExclusive = (p: string) => p === 'Other'
  const hasExclusiveSelected = currentPatterns.some(isExclusive)
  const isThisPatternExclusive = isExclusive(pattern)
  const hasNonExclusiveSelected = currentPatterns.some(
    p => !isExclusive(p) && p !== 'Stimulability'
  )

  if (pattern === 'Stimulability') {
    const nonStimulabilityPatterns = currentPatterns.filter(p => p !== 'Stimulability')
    return nonStimulabilityPatterns.length === 0
  }
  if (hasExclusiveSelected && !currentPatterns.includes(pattern)) return true
  if (hasNonExclusiveSelected && isThisPatternExclusive) return true

  const nonStimulabilityPatterns = currentPatterns.filter(p => p !== 'Stimulability')

  const isSyllableSound = sound === '2 syllables' || sound === '3 syllables'
  if (isSyllableSound && nonStimulabilityPatterns.length > 0 && !currentPatterns.includes(pattern))
    return true

  const isOmissionSelected = currentPatterns.includes('Omission')
  if (sound === 'P' || sound === 'B' || sound === 'Final P') {
    if (pattern === 'Omission' && nonStimulabilityPatterns.length > 0 && !isOmissionSelected)
      return true
    if (pattern !== 'Omission' && isOmissionSelected) return true
  }

  if (sound === 'M' && nonStimulabilityPatterns.length > 0 && !currentPatterns.includes(pattern))
    return true

  if (sound === 'Final T' || sound === 'Final K') {
    if (pattern === 'Omission' && nonStimulabilityPatterns.length > 0 && !isOmissionSelected)
      return true
    if (pattern !== 'Omission' && isOmissionSelected) return true
  }

  const clusterSounds: Record<string, (p: string[]) => boolean> = {
    'St-': isValidStCombination,
    'Sp-': isValidSpCombination,
    'Sn-': isValidSnCombination,
    'Sm-': isValidSmCombination,
    'Sk-': isValidSkCombination,
    'Final -ts': isValidFinalTsCombination,
    'Final -ps': isValidFinalPsCombination,
    'Final -ks': isValidFinalKsCombination,
    K: isValidKGCombination,
    G: isValidKGCombination,
    T: isValidTDCombination,
    D: isValidTDCombination,
    '-ar': isValidArCombination,
    '-or': isValidOrCombination,
  }

  if (clusterSounds[sound]) {
    if (
      nonStimulabilityPatterns.length > 0 &&
      !currentPatterns.includes(pattern) &&
      !clusterSounds[sound]([...nonStimulabilityPatterns, pattern])
    )
      return true
  }

  if (sound === 'L' || sound === 'R') {
    if (nonStimulabilityPatterns.length > 0 && !currentPatterns.includes(pattern)) return true
  }

  const szSounds = ['S', 'Z', 'Ch', 'Sh', 'J', 'F', 'V', 'th']
  if (
    szSounds.includes(sound) &&
    pattern === 'Other' &&
    currentPatterns.some(p => p !== 'Other' && p !== 'Stimulability')
  )
    return true

  return false
}

interface ArticulationCardProps {
  form: UseFormReturn<SpeechScreeningFormValues>
  selectedSounds: string[]
  soundNotes: Record<string, string>
  notes: Record<string, string>
  notesEnabled: Record<string, boolean>
  selectedErrorPatterns: Record<string, string[]>
  selectedStoppingSounds: Record<string, string[]>
  selectedStimulabilityOptions: Record<string, string[]>
  handleSoundToggle: (sound: string) => void
  handleSoundNoteChange: (sound: string, value: string) => void
  handleNotesToggle: (sound: string, enabled: boolean) => void
  handleNoteChange: (sound: string, note: string) => void
  handleStoppingSoundChange: (sound: string, stoppingSound: string, checked: boolean) => void
  handleStimulabilityOptionChange: (sound: string, option: string, checked: boolean) => void
  handleErrorPatternChange: (sound: string, pattern: string, checked: boolean) => void
}

const ArticulationCard = ({
  form,
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
}: ArticulationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Articulation</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
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
                      {/* Error Patterns */}
                      <div className='mt-2 space-y-1'>
                        {soundErrorPatterns[sound]?.patterns.map(patternObj => {
                          const pattern = patternObj.value
                          const patternDisplay = patternObj.display
                          const currentPatterns = selectedErrorPatterns[sound] || []
                          const isDisabled = computePatternDisabled(sound, pattern, currentPatterns)

                          if (pattern === 'Stimulability') {
                            return null
                          }

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

                              {/* Stopping Sound Options */}
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

                              {/* Other Error Pattern input */}
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

                      {/* Notes (Private) */}
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

                      {/* Stimulability */}
                      <div className='space-y-1 mt-1'>
                        <div className='text-xs font-medium text-gray-700'>Stimulability</div>
                        {(selectedErrorPatterns[sound] || []).filter(p => p !== 'Stimulability')
                          .length > 0 && (
                          <RadioGroup
                            value={selectedStimulabilityOptions[sound]?.[0] || 'Word'}
                            onValueChange={value =>
                              handleStimulabilityOptionChange(sound, value, true)
                            }
                            className='ml-2 space-y-1'>
                            {stimulabilityOptions.map(option => (
                              <div key={option} className='flex items-center space-x-2'>
                                <RadioGroupItem
                                  value={option}
                                  id={`${sound}-stimulability-${option}`}
                                />
                                <Label
                                  htmlFor={`${sound}-stimulability-${option}`}
                                  className='text-xs font-normal cursor-pointer'>
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                      </div>

                      {/* Word example */}
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
      </CardContent>
    </Card>
  )
}

export default ArticulationCard
