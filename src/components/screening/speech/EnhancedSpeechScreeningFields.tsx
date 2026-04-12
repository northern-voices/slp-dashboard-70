import { UseFormReturn } from 'react-hook-form'
import { useSpeechScreeningState } from './useSpeechScreeningState'
import { SpeechScreeningFormValues } from '@/types/screening-form'
import AreasOfConcernCard from './AreasOfConcernCard'
import ArticulationCard from './ArticulationCard'

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
      <ArticulationCard
        form={form}
        selectedSounds={selectedSounds}
        soundNotes={soundNotes}
        notes={notes}
        notesEnabled={notesEnabled}
        selectedErrorPatterns={selectedErrorPatterns}
        selectedStoppingSounds={selectedStoppingSounds}
        selectedStimulabilityOptions={selectedStimulabilityOptions}
        handleSoundToggle={handleSoundToggle}
        handleSoundNoteChange={handleSoundNoteChange}
        handleNotesToggle={handleNotesToggle}
        handleNoteChange={handleNoteChange}
        handleStoppingSoundChange={handleStoppingSoundChange}
        handleStimulabilityOptionChange={handleStimulabilityOptionChange}
        handleErrorPatternChange={handleErrorPatternChange}
      />

      <AreasOfConcernCard
        form={form}
        selectedConcerns={selectedConcerns}
        areasOfConcernOpen={areasOfConcernOpen}
        setAreasOfConcernOpen={setAreasOfConcernOpen}
        handleConcernChange={handleConcernChange}
        getFieldName={getFieldName}
      />
    </div>
  )
}

export default EnhancedSpeechScreeningFields
