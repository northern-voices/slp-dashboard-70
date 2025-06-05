
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Send } from 'lucide-react';
import { Student } from '@/types/database';
import { ScreeningFormData } from '@/types/screening';

interface IndividualSpeechScreeningFormProps {
  onSubmit: (data: ScreeningFormData) => void;
  onCancel: () => void;
  existingStudent?: Student | null;
}

const IndividualSpeechScreeningForm = ({
  onSubmit,
  onCancel,
  existingStudent,
}: IndividualSpeechScreeningFormProps) => {
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedSounds, setSelectedSounds] = useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      student_name: existingStudent ? `${existingStudent.first_name} ${existingStudent.last_name}` : '',
      grade: existingStudent?.grade || '',
      screening_date: new Date().toISOString().split('T')[0],
      screening_type: 'initial',
      teacher_concerns: '',
      articulation_sounds: '',
      language_concerns: '',
      voice_quality: 'normal',
      fluency_concerns: '',
      overall_intelligibility: 'good',
      recommendations: '',
      follow_up_required: false,
      referral_needed: false,
      parent_contact: false,
      general_notes: '',
    }
  });

  const speechConcerns = [
    'Articulation/Sound Production',
    'Language Expression',
    'Language Comprehension',
    'Voice Quality',
    'Fluency/Stuttering',
    'Social Communication'
  ];

  const commonSounds = [
    '/r/', '/s/', '/z/', '/th/', '/l/', '/k/', '/g/', '/f/', '/v/', '/sh/', '/ch/', '/j/',
    '/bl/', '/br/', '/cl/', '/cr/', '/dr/', '/fl/', '/fr/', '/gl/', '/gr/', '/pl/', '/pr/',
    '/sc/', '/sk/', '/sl/', '/sm/', '/sn/', '/sp/', '/st/', '/sw/', '/tr/', '/tw/'
  ];

  const handleConcernToggle = (concern: string) => {
    setSelectedConcerns(prev => 
      prev.includes(concern) 
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    );
  };

  const handleSoundToggle = (sound: string) => {
    setSelectedSounds(prev => 
      prev.includes(sound) 
        ? prev.filter(s => s !== sound)
        : [...prev, sound]
    );
  };

  const handleFormSubmit = (data: any) => {
    const formData: ScreeningFormData = {
      student_id: existingStudent?.id,
      screening_type: data.screening_type,
      screening_date: data.screening_date,
      form_type: 'speech',
      speech_data: {
        sound_errors: selectedSounds,
        articulation_notes: data.articulation_sounds,
        language_concerns: data.language_concerns,
        voice_quality: data.voice_quality,
        fluency_notes: data.fluency_concerns,
        overall_observations: data.general_notes,
      },
      general_notes: data.general_notes,
      recommendations: data.recommendations,
      follow_up_required: data.follow_up_required,
    };

    if (!existingStudent) {
      const nameParts = data.student_name.split(' ');
      formData.student_info = {
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        date_of_birth: '',
        grade: data.grade,
      };
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="student_name">Student Name</Label>
            <Input
              {...form.register('student_name')}
              disabled={!!existingStudent}
              className={existingStudent ? 'bg-gray-100' : ''}
            />
          </div>
          <div>
            <Label htmlFor="grade">Grade</Label>
            <Input
              {...form.register('grade')}
              disabled={!!existingStudent}
              className={existingStudent ? 'bg-gray-100' : ''}
            />
          </div>
          <div>
            <Label htmlFor="screening_date">Screening Date</Label>
            <Input
              type="date"
              {...form.register('screening_date')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Screening Type */}
      <Card>
        <CardHeader>
          <CardTitle>Screening Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Screening Type</Label>
            <Select onValueChange={(value) => form.setValue('screening_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select screening type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial">Initial Screening</SelectItem>
                <SelectItem value="follow_up">Follow-up Screening</SelectItem>
                <SelectItem value="annual">Annual Screening</SelectItem>
                <SelectItem value="referral">Referral Screening</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Speech Concerns */}
      <Card>
        <CardHeader>
          <CardTitle>Areas of Concern</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {speechConcerns.map(concern => (
              <div key={concern} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedConcerns.includes(concern)}
                  onCheckedChange={() => handleConcernToggle(concern)}
                />
                <Label className="text-sm">{concern}</Label>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Label htmlFor="teacher_concerns">Teacher/Parent Concerns</Label>
            <Textarea
              {...form.register('teacher_concerns')}
              placeholder="Describe specific concerns noted by teacher or parent..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Articulation Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Articulation/Sound Production</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Sounds in Error (select all that apply)</Label>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mt-2">
              {commonSounds.map(sound => (
                <Button
                  key={sound}
                  type="button"
                  variant={selectedSounds.includes(sound) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSoundToggle(sound)}
                  className="text-xs"
                >
                  {sound}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="articulation_sounds">Additional Notes</Label>
            <Textarea
              {...form.register('articulation_sounds')}
              placeholder="Describe error patterns, stimulability, consistency..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="language_concerns">Language Concerns</Label>
          <Textarea
            {...form.register('language_concerns')}
            placeholder="Note concerns with vocabulary, grammar, sentence structure, comprehension..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Voice and Fluency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Voice Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              defaultValue="normal"
              onValueChange={(value) => form.setValue('voice_quality', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" />
                <Label>Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hoarse" />
                <Label>Hoarse</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="breathy" />
                <Label>Breathy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="harsh" />
                <Label>Harsh</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nasal" />
                <Label>Nasal</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fluency</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="fluency_concerns">Fluency Observations</Label>
            <Textarea
              {...form.register('fluency_concerns')}
              placeholder="Note any disfluencies, patterns, secondary behaviors..."
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      {/* Overall Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Overall Intelligibility</Label>
            <RadioGroup 
              defaultValue="good"
              onValueChange={(value) => form.setValue('overall_intelligibility', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excellent" />
                <Label>Excellent (95-100%)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" />
                <Label>Good (85-94%)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fair" />
                <Label>Fair (65-84%)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poor" />
                <Label>Poor (Below 65%)</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="general_notes">Additional Observations</Label>
            <Textarea
              {...form.register('general_notes')}
              placeholder="Include observations about communication effectiveness, social communication, attention..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recommendations and Follow-up */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations & Follow-up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea
              {...form.register('recommendations')}
              placeholder="Provide specific recommendations for intervention, classroom strategies, etc..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox {...form.register('follow_up_required')} />
              <Label>Follow-up screening recommended</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox {...form.register('referral_needed')} />
              <Label>Referral for further evaluation needed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox {...form.register('parent_contact')} />
              <Label>Parent contact recommended</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="outline" className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Draft
        </Button>
        <Button type="submit" className="flex items-center gap-2">
          <Send className="w-4 h-4" />
          Submit Screening
        </Button>
      </div>
    </form>
  );
};

export default IndividualSpeechScreeningForm;
