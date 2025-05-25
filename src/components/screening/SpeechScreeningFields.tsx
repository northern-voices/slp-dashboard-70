
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';

interface SpeechScreeningFieldsProps {
  form: UseFormReturn<any>;
}

const commonSoundErrors = [
  '/r/', '/s/', '/z/', '/th/', '/l/', '/k/', '/g/', '/f/', '/v/', '/sh/', '/ch/', '/j/'
];

const SpeechScreeningFields = ({ form }: SpeechScreeningFieldsProps) => {
  const [selectedSounds, setSelectedSounds] = useState<string[]>([]);

  const toggleSound = (sound: string) => {
    const updated = selectedSounds.includes(sound)
      ? selectedSounds.filter(s => s !== sound)
      : [...selectedSounds, sound];
    setSelectedSounds(updated);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Articulation Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Sound Errors Observed</Label>
            <p className="text-sm text-gray-600 mb-3">Select the sounds that show consistent error patterns</p>
            <div className="flex flex-wrap gap-2">
              {commonSoundErrors.map(sound => (
                <Badge
                  key={sound}
                  variant={selectedSounds.includes(sound) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => toggleSound(sound)}
                >
                  {sound}
                </Badge>
              ))}
            </div>
            <div className="mt-3">
              <Input
                placeholder="Add other sound errors (e.g., /bl/ blends, /str/ clusters)"
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="articulation_notes">Articulation Notes</Label>
            <Textarea
              placeholder="Describe specific error patterns, stimulability, consistency of errors..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Language Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="language_concerns">Language Concerns</Label>
            <Textarea
              placeholder="Note any concerns with vocabulary, grammar, sentence structure, comprehension..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Voice Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {['Normal', 'Hoarse', 'Breathy', 'Harsh', 'Nasal', 'Loud', 'Quiet'].map(quality => (
                  <Badge key={quality} variant="outline" className="cursor-pointer hover:bg-blue-100">
                    {quality}
                  </Badge>
                ))}
              </div>
              <Textarea
                placeholder="Additional voice quality observations..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fluency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {['Typical', 'Repetitions', 'Prolongations', 'Blocks', 'Secondary behaviors'].map(pattern => (
                  <Badge key={pattern} variant="outline" className="cursor-pointer hover:bg-blue-100">
                    {pattern}
                  </Badge>
                ))}
              </div>
              <Textarea
                placeholder="Describe fluency patterns, frequency, severity..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Include observations about communication effectiveness, social communication skills, response to cues, attention during screening..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeechScreeningFields;
