
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AuthFormField from '@/components/auth/AuthFormField';

interface ProfessionalInfoStepProps {
  formData: {
    licenseNumber: string;
    licenseState: string;
    yearsExperience: string;
    specializations: string[];
    bio: string;
    education: string;
  };
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
}

const ProfessionalInfoStep = ({ formData, setFormData, onNext, onBack, errors }: ProfessionalInfoStepProps) => {
  const updateField = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const specializations = [
    'Articulation/Phonology',
    'Fluency',
    'Voice',
    'Language',
    'Hearing',
    'Swallowing',
    'Cognitive Communication',
    'Social Communication'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Professional Information</h3>
        <p className="text-gray-600">
          Tell us about your professional background and qualifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AuthFormField
          label="License Number"
          placeholder="Enter your license number"
          value={formData.licenseNumber}
          onChange={(value) => updateField('licenseNumber', value)}
          error={errors.licenseNumber}
          required
        />
        
        <div className="space-y-2">
          <Label>License State *</Label>
          <Select 
            value={formData.licenseState} 
            onValueChange={(value) => updateField('licenseState', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CA">California</SelectItem>
              <SelectItem value="NY">New York</SelectItem>
              <SelectItem value="TX">Texas</SelectItem>
              <SelectItem value="FL">Florida</SelectItem>
            </SelectContent>
          </Select>
          {errors.licenseState && <p className="text-sm text-red-600">{errors.licenseState}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Years of Experience</Label>
        <Select 
          value={formData.yearsExperience} 
          onValueChange={(value) => updateField('yearsExperience', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-1">0-1 years</SelectItem>
            <SelectItem value="2-5">2-5 years</SelectItem>
            <SelectItem value="6-10">6-10 years</SelectItem>
            <SelectItem value="11-15">11-15 years</SelectItem>
            <SelectItem value="15+">15+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AuthFormField
        label="Education"
        placeholder="e.g., M.A. Speech-Language Pathology, University Name"
        value={formData.education}
        onChange={(value) => updateField('education', value)}
        error={errors.education}
      />

      <div className="space-y-2">
        <Label>Professional Bio</Label>
        <Textarea
          placeholder="Tell us about your professional background, interests, and approach..."
          value={formData.bio}
          onChange={(e) => updateField('bio', e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} className="px-8">
          Next: Preferences
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalInfoStep;
