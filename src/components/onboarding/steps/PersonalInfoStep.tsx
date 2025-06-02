
import React from 'react';
import { Button } from '@/components/ui/button';
import AuthFormField from '@/components/auth/AuthFormField';

interface PersonalInfoStepProps {
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  setFormData: (data: any) => void;
  onNext: () => void;
  errors: Record<string, string>;
}

const PersonalInfoStep = ({ formData, setFormData, onNext, errors }: PersonalInfoStepProps) => {
  const updateField = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
        <p className="text-gray-600">
          Please provide your contact information to complete your profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AuthFormField
          label="First Name"
          value={formData.firstName}
          onChange={(value) => updateField('firstName', value)}
          error={errors.firstName}
          required
        />
        
        <AuthFormField
          label="Last Name"
          value={formData.lastName}
          onChange={(value) => updateField('lastName', value)}
          error={errors.lastName}
          required
        />
      </div>

      <AuthFormField
        label="Phone Number"
        type="tel"
        placeholder="(555) 123-4567"
        value={formData.phone}
        onChange={(value) => updateField('phone', value)}
        error={errors.phone}
      />

      <AuthFormField
        label="Street Address"
        placeholder="123 Main Street"
        value={formData.address}
        onChange={(value) => updateField('address', value)}
        error={errors.address}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AuthFormField
          label="City"
          value={formData.city}
          onChange={(value) => updateField('city', value)}
          error={errors.city}
        />
        
        <AuthFormField
          label="State"
          placeholder="CA"
          value={formData.state}
          onChange={(value) => updateField('state', value)}
          error={errors.state}
        />
        
        <AuthFormField
          label="ZIP Code"
          placeholder="12345"
          value={formData.zipCode}
          onChange={(value) => updateField('zipCode', value)}
          error={errors.zipCode}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} className="px-8">
          Next: Professional Info
        </Button>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
