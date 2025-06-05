import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface EnhancedSpeechScreeningFieldsProps {
  form: UseFormReturn<any>;
}

const areasOfConcern = [
  'Articulation/Sound Production',
  'Language Expression',
  'Language Comprehension',
  'Voice Quality',
  'Fluency/Stuttering',
  'Social Communication'
];

const singleSounds = ['/r/', '/s/', '/z/', '/th/', '/l/', '/k/', '/g/', '/f/', '/v/', '/sh/', '/ch/', '/j/'];
const blendsClusters = ['/bl/', '/br/', '/cl/', '/cr/', '/dr/', '/fl/', '/fr/', '/gl/', '/gr/', '/pl/', '/pr/', '/sc/', '/sk/', '/sl/', '/sm/', '/sn/', '/sp/', '/st/', '/sw/', '/tr/', '/tw/'];

const EnhancedSpeechScreeningFields = ({ form }: EnhancedSpeechScreeningFieldsProps) => {
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedSounds, setSelectedSounds] = useState<string[]>([]);
  const [soundNotes, setSoundNotes] = useState<Record<string, string>>({});
  const [articulationOpen, setArticulationOpen] = useState(false);

  const handleConcernChange = (concern: string, checked: boolean) => {
    if (checked) {
      setSelectedConcerns([...selectedConcerns, concern]);
    } else {
      setSelectedConcerns(selectedConcerns.filter(c => c !== concern));
    }
  };

  const handleSoundToggle = (sound: string) => {
    if (selectedSounds.includes(sound)) {
      setSelectedSounds(selectedSounds.filter(s => s !== sound));
      const newNotes = { ...soundNotes };
      delete newNotes[sound];
      setSoundNotes(newNotes);
    } else {
      setSelectedSounds([...selectedSounds, sound]);
    }
  };

  const handleSoundNoteChange = (sound: string, note: string) => {
    setSoundNotes({
      ...soundNotes,
      [sound]: note
    });
  };

  return (
    <div className="space-y-6">
      {/* Areas of Concern */}
      <Card>
        <CardHeader>
          <CardTitle>Areas of Concern</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {areasOfConcern.map((concern) => (
              <div key={concern} className="flex items-center space-x-2">
                <Checkbox
                  id={concern}
                  checked={selectedConcerns.includes(concern)}
                  onCheckedChange={(checked) => handleConcernChange(concern, checked as boolean)}
                />
                <Label htmlFor={concern} className="text-sm font-medium">
                  {concern}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Articulation/Sound Production - Detailed Assessment */}
      {selectedConcerns.includes('Articulation/Sound Production') && (
        <Card>
          <Collapsible open={articulationOpen} onOpenChange={setArticulationOpen}>
            <CardHeader>
              <CollapsibleTrigger className="flex items-center gap-2 w-full">
                {articulationOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <CardTitle>Articulation/Sound Production Assessment</CardTitle>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Single Sounds */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Single Sounds in Error</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                    {singleSounds.map((sound) => (
                      <div key={sound} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => handleSoundToggle(sound)}
                          className={`p-2 text-center border rounded-md transition-colors ${
                            selectedSounds.includes(sound)
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {sound}
                        </button>
                        {selectedSounds.includes(sound) && (
                          <Textarea
                            placeholder="Notes..."
                            value={soundNotes[sound] || ''}
                            onChange={(e) => handleSoundNoteChange(sound, e.target.value)}
                            className="mt-2 text-xs"
                            rows={2}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blends and Clusters */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Blends/Clusters in Error</Label>
                  <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                    {blendsClusters.map((sound) => (
                      <div key={sound} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => handleSoundToggle(sound)}
                          className={`p-2 text-center border rounded-md transition-colors ${
                            selectedSounds.includes(sound)
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {sound}
                        </button>
                        {selectedSounds.includes(sound) && (
                          <Textarea
                            placeholder="Notes..."
                            value={soundNotes[sound] || ''}
                            onChange={(e) => handleSoundNoteChange(sound, e.target.value)}
                            className="mt-2 text-xs"
                            rows={2}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* General Articulation Notes */}
                <div>
                  <Label htmlFor="general_articulation_notes">General Articulation Notes</Label>
                  <Textarea
                    {...form.register('general_articulation_notes')}
                    placeholder="Overall patterns, stimulability, consistency..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Other Areas Assessments */}
      {selectedConcerns.includes('Language Expression') && (
        <Card>
          <CardHeader>
            <CardTitle>Language Expression</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...form.register('language_expression_notes')}
              placeholder="Vocabulary, grammar, sentence structure, word finding..."
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
              {...form.register('language_comprehension_notes')}
              placeholder="Following directions, understanding questions, comprehension of complex language..."
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {selectedConcerns.includes('Voice Quality') && (
        <Card>
          <CardHeader>
            <CardTitle>Voice Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...form.register('voice_quality_notes')}
              placeholder="Hoarseness, breathiness, loudness, pitch concerns..."
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {selectedConcerns.includes('Fluency/Stuttering') && (
        <Card>
          <CardHeader>
            <CardTitle>Fluency/Stuttering</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...form.register('fluency_notes')}
              placeholder="Repetitions, prolongations, blocks, secondary behaviors..."
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
              {...form.register('social_communication_notes')}
              placeholder="Eye contact, turn-taking, pragmatic language use..."
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {/* Speech Screen Result */}
      <Card>
        <CardHeader>
          <CardTitle>Speech Screen Result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="speech_screen_result">Result *</Label>
              <Select value={form.watch('speech_screen_result')} onValueChange={(value) => form.setValue('speech_screen_result', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="mild_moderate">Mild/Moderate</SelectItem>
                  <SelectItem value="profound">Profound</SelectItem>
                  <SelectItem value="non_registered">Non-registered</SelectItem>
                  <SelectItem value="complex_needs">Complex Needs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="overall_notes">Overall Assessment Notes</Label>
              <Textarea
                {...form.register('overall_notes')}
                placeholder="Summary of findings, recommendations, next steps..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSpeechScreeningFields;
